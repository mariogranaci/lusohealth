﻿using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

using ServicesDto = LusoHealthClient.Server.DTOs.Services.ServicesDto;
using ServiceProfileDto = LusoHealthClient.Server.DTOs.Profile.ServiceDto;
using LusoHealthClient.Server.DTOs.Appointments;

namespace LusoHealthClient.Server.Controllers
{
	/// <summary>
	/// Controlador responsável por lidar com a lógica relacionada à página inicial e aos serviços oferecidos.
	/// </summary>
	[Route("api/[controller]")]
	[ApiController]
	public class HomeController : ControllerBase
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<User> _userManager;
		private readonly ILogger<ProfileController> _logger;

		/// <summary>
		/// Construtor da classe HomeController.
		/// </summary>
		/// <param name="context">Contexto da base de dados.</param>
		/// <param name="userManager">O usermanager dos utilizadores.</param>
		/// <param name="logger">O logger para registrar informações de log.</param>
		public HomeController(ApplicationDbContext context, UserManager<User> userManager, ILogger<ProfileController> logger)
		{
			_context = context;
			_userManager = userManager;
			_logger = logger;
		}

		/// <summary>
		/// Método para obter informações sobre um serviço específico.
		/// </summary>
		[Authorize]
		[HttpGet("get-service-info/{id}")]
		public async Task<ActionResult<MakeAppointmentDto>> GetServiceInfo(int id)
		{
			var info = await _context.Services
				.Include(s => s.Specialty)
				.ThenInclude(o => o.ProfessionalType)
				.Include(p => p.Professional)
				.ThenInclude(u => u.User)
				.FirstOrDefaultAsync(x => x.Id == id);

            if (info == null)
            {
                return BadRequest("Não foi possível encontrar a informação do serviço.");
            }

            MakeAppointmentDto makeAppointmentDto = new MakeAppointmentDto
            {
                ServiceId = info.Id,
                SpecialtyId = info.IdSpecialty,
                Specialty = info.Specialty.Name,
                ProfessionalName = info.Professional.User.FirstName + " " + info.Professional.User.LastName,
                Category = info.Specialty.ProfessionalType.Name,
                Online = info.Online,
                Presential = info.Presential,
                PricePerHour = info.PricePerHour,
                Home = info.Home,
            };

            return makeAppointmentDto;
        }


        /// <summary>
		/// Método para adicionar uma nova consulta.
		/// </summary>
        [HttpPost("add-appointment")]
        public async Task<ActionResult> AddAppointment(AppointmentDto appointmentDto)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                    var user = await _userManager.FindByIdAsync(userId);
                    if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                    var info = await _context.Services
                    .FirstOrDefaultAsync(x => x.Id == appointmentDto.IdService);

                    if (info == null) return BadRequest("Não foi possível encontrar a informação do serviço.");

                    if (appointmentDto.Timestamp < DateTime.Now) return BadRequest("Não é possível marcar uma consulta para uma data passada.");

                    if (!appointmentDto.Timestamp.HasValue)
                    {
                        return BadRequest("Algo correu mal.");
                    }

                    var slot = await _context.AvailableSlots.FirstOrDefaultAsync(x => x.IdService == appointmentDto.IdService && x.Start == appointmentDto.Timestamp);

                    if (slot == null) return BadRequest("Não foi possível encontrar o slot.");

                    if (!Enum.TryParse(appointmentDto.Type, out AppointmentType appointmentType))
                    {
                        throw new ArgumentException("Algo correu mal.");
                    }

                    var appointmentInfo = new Appointment
                    {
                        Timestamp = appointmentDto.Timestamp.Value,
                        Location = appointmentDto.Location,
                        Type = appointmentType,
                        Description = appointmentDto.Description,
                        State = AppointmentState.PaymentPending,
                        Duration = appointmentDto.Duration,
                        IdPatient = user.Id,
                        IdProfesional = info.IdProfessional,
                        IdService = info.Id,
                    };

                    _context.Appointment.Add(appointmentInfo);
                    await _context.SaveChangesAsync();

                    // update the slot to be avaliable=false and add the appointment id to the slot
                    slot.IsAvailable = false;
                    slot.AppointmentId = appointmentInfo.Id;

                    _context.AvailableSlots.Update(slot);

                    await _context.SaveChangesAsync();

                    // Commit the transaction if all operations succeed
                    transaction.Commit();

                    return Ok(new { message = "A consulta foi marcada com sucesso.", appointmentId = appointmentInfo.Id });
                }
                catch (Exception)
                {
                    transaction.Rollback();

                    return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao marcar consulta.");
                }
            }
        }



		/// <summary>
		/// Método para obter os tipos de profissionais.
		/// </summary>
		[HttpGet("get-professional-types")]
        public async Task<ActionResult<List<ProfessionalType>>> GetProfessionalTypes()
        {
            try
            {
                var professionalTypes = await _context.ProfessionalTypes.ToListAsync();
                if (professionalTypes == null) return NotFound("Não foram encontrados tipos de profissionais");
                return professionalTypes;
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a obter os tipos de profissionais");
            }
        }

		/// <summary>
		/// Método para obter informações sobre os profissionais disponíveis.
		/// </summary>
		[HttpGet("get-professionals")]
        public async Task<ActionResult<List<ProfessionalDto>>> GetProfessionals()
        {
            var professionals = await _context.Professionals
                .Include(pt => pt.ProfessionalType)
                .ToListAsync();

            if (professionals == null)
            {
                return NotFound("Não foi possível encontrar os profissionais");
            }

            var professionalsDtoList = new List<ProfessionalDto>();

            foreach (var professional in professionals)
            {
                var user = await _context.Users.FindAsync(professional.UserID);

                var servicesFromDB = await _context.Services
                    .Include(s => s.Specialty)
                    .Where(s => s.IdProfessional == professional.UserID)
                    .ToListAsync();
                var services = GetServiceProfileDtos(servicesFromDB);

                var reviewsFromDB = await _context.Reviews
                    .Include(r => r.Service)
                    .Where(r => r.Service.IdProfessional == professional.UserID)
                    .ToListAsync();
                var reviews = GetReviewDtos(reviewsFromDB);

                var professionalDto = new ProfessionalDto
                {
                    ProfessionalInfo = new UserProfileDto { FirstName = user.FirstName, LastName = user.LastName },
                    Services = services,
                    Certificates = null,
                    Reviews = reviews,
                    Location = professional.Location,
                    Description = professional.Description,
                    ProfessionalType = professional.ProfessionalType.Name
                };

                professionalsDtoList.Add(professionalDto);
            }

            return professionalsDtoList;
        }

		/// <summary>
		/// Método para obter as especialidades disponíveis.
		/// </summary>
		[HttpGet("get-specialties")]
        public Task<ActionResult<List<Specialty>>> GetSpecialties()
        {
            try
            {
                var specialties = _context.Specialties.OrderByDescending(a => a.Name).ToList();
                if (specialties == null) { return Task.FromResult<ActionResult<List<Specialty>>>(NotFound("Não foi possível encontrar as especialidades")); }
                return Task.FromResult<ActionResult<List<Specialty>>>(specialties);
            }
            catch (Exception)
            {
                return Task.FromResult<ActionResult<List<Specialty>>>(BadRequest("Não foi possível encontrar as especialidades. Tente novamente."));
            }
        }

		/// <summary>
		/// Método para obter os serviços disponíveis.
		/// </summary>
		[HttpGet("get-services")]
        public async Task<List<ServicesDto>> GetServices()
        {
            var servicesFromDB = await _context.Services.Include(s => s.Specialty).Include(d => d.Professional).ThenInclude(a => a.ProfessionalType).ToListAsync();
            var services = await GetServiceDtos(servicesFromDB);

            return services;
        }

		/// <summary>
		/// Método para obter profissionais com base na localização fornecida.
		/// </summary>
		[HttpPost("get-professionals-on-location")]
        public async Task<ActionResult<List<ProfessionalDto>>> GetProfessionalsOnLocation(BoundsDto locationDto)
        {
            double latNE = locationDto.LatitudeNorthEast;
            double longNE = locationDto.LongitudeNorthEast;
            double latSW = locationDto.LatitudeSouthWest;
            double longSW = locationDto.LongitudeSouthWest;

            var professionalsUnfiltered = await _context.Professionals
            .Include(pt => pt.ProfessionalType)
            .ToListAsync();

            var professionals = professionalsUnfiltered.Where(p =>
                {
                    if (string.IsNullOrEmpty(p.Location)) return false;

                    var locationParts = p.Location.Split(';');

                    if (locationParts.Length != 2) return false;

                    // Tenta analisar as partes de localização para doubles
                    if (!double.TryParse(locationParts[0], out var lat)) return false;
                    if (!double.TryParse(locationParts[1], out var lng)) return false;

                    return lat <= latNE && lat >= latSW && lng <= longNE && lng >= longSW;
                }).ToList();


            if (professionals == null)
            {
                return NotFound("Não foi possível encontrar os profissionais");
            }

            var professionalsDtoList = new List<ProfessionalDto>();

            foreach (var professional in professionals)
            {
                var user = await _context.Users.FindAsync(professional.UserID);

                var servicesFromDB = await _context.Services
                    .Include(s => s.Specialty)
                    .Where(s => s.IdProfessional == professional.UserID)
                    .ToListAsync();
                var services = GetServiceProfileDtos(servicesFromDB);

                var reviewsFromDB = await _context.Reviews
                    .Include(r => r.Service)
                    .Where(r => r.Service.IdProfessional == professional.UserID)
                    .ToListAsync();
                var reviews = GetReviewDtos(reviewsFromDB);

                var professionalDto = new ProfessionalDto
                {
                    ProfessionalInfo = new UserProfileDto { Id = user.Id, FirstName = user.FirstName, LastName = user.LastName, Picture = user.ProfilePicPath },
                    Services = services,
                    Certificates = null,
                    Reviews = reviews,
                    Location = professional.Location,
                    Description = professional.Description,
                    ProfessionalType = professional.ProfessionalType.Name
                };

                professionalsDtoList.Add(professionalDto);
            }

            return professionalsDtoList;
        }


        #region private helper methods
        private async Task<List<ServicesDto>> GetServiceDtos(List<Service> services)
        {
            var serviceDtos = new List<ServicesDto>();
            foreach (var service in services)
            {
                var serviceDto = new ServicesDto
                {
                    ServiceId = service.Id,
                    SpecialtyId = service.IdSpecialty,
                    Specialty = service.Specialty.Name,
                    PricePerHour = service.PricePerHour,
                    Online = service.Online,
                    Presential = service.Presential,
                    Home = service.Home,
                    Professional = await GetProfessionalInfo(service.Professional),
                };
                serviceDtos.Add(serviceDto);
            }
            return serviceDtos;
        }
        private List<ServiceProfileDto> GetServiceProfileDtos(List<Service> services)
        {
            var serviceDtos = new List<ServiceProfileDto>();
            foreach (var service in services)
            {
                var serviceDto = new ServiceProfileDto
                {
                    ServiceId = service.Id,
                    SpecialtyId = service.IdSpecialty,
                    Specialty = service.Specialty.Name,
                    PricePerHour = service.PricePerHour,
                    Online = service.Online,
                    Presential = service.Presential,
                    Home = service.Home
                };
                serviceDtos.Add(serviceDto);
            }
            return serviceDtos;
        }

        private List<ReviewDto> GetReviewDtos(List<Review> reviews)
        {
            var reviewDtos = new List<ReviewDto>();
            foreach (var review in reviews)
            {
                ReviewDto reviewDto = new ReviewDto
                {
                    IdService = review.IdService,
                    ServiceName = review.Service.Specialty.Name,
                    Stars = review.Stars,
                    Description = review.Description
                };
                reviewDtos.Add(reviewDto);
            }
            return reviewDtos;
        }

        private async Task<ProfessionalDto> GetProfessionalInfo(Professional professional)
        {
            var user = await _context.Users.FindAsync(professional.UserID);

            var servicesFromDB = await _context.Services
                .Include(s => s.Specialty)
                .Where(s => s.IdProfessional == professional.UserID)
                .ToListAsync();
            var services = GetServiceProfileDtos(servicesFromDB);

            var reviewsFromDB = await _context.Reviews
                .Include(r => r.Service)
                .Where(r => r.Service.IdProfessional == professional.UserID)
                .ToListAsync();
            var reviews = GetReviewDtos(reviewsFromDB);

            var professionalDto = new ProfessionalDto
            {
                ProfessionalInfo = new UserProfileDto { FirstName = user.FirstName, LastName = user.LastName },
                Services = services,
                Certificates = null,
                Reviews = reviews,
                Location = professional.Location,
                Description = professional.Description,
                ProfessionalType = professional.ProfessionalType.Name
            };

            return professionalDto;
        }
        #endregion
    }
}
