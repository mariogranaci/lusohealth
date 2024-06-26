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
using Microsoft.IdentityModel.Tokens;
using LusoHealthClient.Server.Models.Chat;
using System.Globalization;

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

		/// <summary>
		/// Construtor da classe HomeController.
		/// </summary>
		/// <param name="context">Contexto da base de dados.</param>
		/// <param name="userManager">O usermanager dos utilizadores.</param>
		/// <param name="logger">O logger para registrar informações de log.</param>
		public HomeController(ApplicationDbContext context, UserManager<User> userManager)
		{
			_context = context;
			_userManager = userManager;
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
                ProfessionalId = info.Professional.UserID,
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

                    var specialty = await _context.Specialties.FirstOrDefaultAsync(x => x.Id == info.IdSpecialty);
                    if (specialty == null) return NotFound("Não foi possível encontrar a especialidade.");
                    specialty.TimesScheduled++;

                    if (appointmentDto.Timestamp < DateTime.Now) return BadRequest("Não é possível marcar uma consulta para uma data passada.");

                    if (!appointmentDto.Timestamp.HasValue)
                    {
                        return BadRequest("Algo correu mal.");
                    }

                    var slot = await _context.AvailableSlots.FirstOrDefaultAsync(x => x.IdService == appointmentDto.IdService && x.Start == appointmentDto.Timestamp);

                    if (slot == null) return BadRequest("Não foi possível encontrar a vaga.");

                    if (!slot.IsAvailable) return BadRequest("A vaga já não está disponível.");

                    var service = await _context.Services.FirstOrDefaultAsync(x => x.Id == appointmentDto.IdService);
                    if (service == null) return NotFound("Não foi possível encontrar o serviço.");


                    var professional = await _context.Professionals.FirstOrDefaultAsync(x => x.UserID == service.IdProfessional);
                    if (professional == null) return NotFound("Houve um problema a localizar o profissional");


                    Address? address = null;
                    if (professional.AddressId != null)
                    {
                        address = await _context.Addresses.FirstOrDefaultAsync(x => x.Id == professional.AddressId);
                    }
                    
                    
                    int? addressId = null;

                    if (appointmentDto.Type == "Presential")
                    {
                        if (address == null || address.Location.IsNullOrEmpty() || address.AddressName.IsNullOrEmpty()) return BadRequest("O profissional não tem localização definida.");

                        addressId = address.Id;

                        appointmentDto.Location = address.Location;
                        appointmentDto.Address = address.AddressName;
                    }
                    else if (appointmentDto.Type == "Home")
                    {
                        var newAddress = new Address
                        {
                            AddressName = appointmentDto.Address,
                            Location = appointmentDto.Location
                        };

                        _context.Addresses.Add(newAddress);
                        await _context.SaveChangesAsync();

                        addressId = newAddress.Id;
                    }

                    if (!Enum.TryParse(appointmentDto.Type, out AppointmentType appointmentType))
                    {
                        throw new ArgumentException("Algo correu mal.");
                    }

                    var appointmentInfo = new Appointment
                    {
                        Timestamp = appointmentDto.Timestamp.Value,
                        AddressId = addressId,
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

                    if (appointmentDto.Type == "Online")
                    {
                        var newChat = new Chat
                        {
                            AppointmentId = appointmentInfo.Id,
                            IsActive = false
                        };
                        _context.Chat.Add(newChat);
                    }

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
                .Include(a => a.Address)
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
                    Location = professional.Address != null ? professional.Address.Location : null,
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

        [HttpGet("get-best-services")]
        public async Task<ActionResult<List<BestServicesDto>>> GetBestServices()
        {
            try
            {
                var groupedServices = await _context.Services
                .Include(s => s.Specialty)
                .ThenInclude(pt => pt.ProfessionalType)
                .Include(s => s.Reviews)
                .Include(s => s.Professional)
                .ThenInclude(u => u.User)
                .GroupBy(p => p.Specialty.ProfessionalTypeId)
                .ToListAsync();

                var bestServices = new List<BestServicesDto>();

                foreach (var group in groupedServices)
                {
                    var bestCategoryServices = group.OrderByDescending(s => s.Reviews.Select(r => r.Stars).DefaultIfEmpty(0).Average()).Take(5);
                    var services = bestCategoryServices.Select(bs => new BestServicesDto
                    {
                        ServiceId = bs.Id,
                        SpecialtyId = bs.IdSpecialty,
                        ProfessionalTypeId = bs.Specialty.ProfessionalTypeId,
                        Specialty = bs.Specialty.Name,
                        PricePerHour = bs.PricePerHour,
                        Professional = new ProfessionalDto
                        {
                            ProfessionalInfo = new UserProfileDto
                            {
                                FirstName = bs.Professional.User.FirstName,
                                LastName = bs.Professional.User.LastName
                            }
                        },
                        Rating = bs.Reviews.Select(r => r.Stars).DefaultIfEmpty(0).Average()
                    }).ToList();
                    if (services.Count == 0) continue;

                    bestServices.AddRange(services);
                }

                return Ok(bestServices);

            } catch (Exception)
            {
                return StatusCode(500, "Não foi possível encontrar os serviços.");
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

        [HttpGet("get-services-filtered")]
        public async Task<List<ServicesDto>> GetServicesFiltered(string? professionalType = null, string? specialty = null, string? searchTerm = null, string? serviceType = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Services
                .Include(s => s.Specialty)
                .Include(d => d.Professional).ThenInclude(a => a.ProfessionalType)
                .AsQueryable();

            // Apply filters if parameters are not null or whitespace
            int professionalTypeId;
            if (professionalType != "0" && int.TryParse(professionalType, out professionalTypeId))
            {
                query = query.Where(s => s.Professional.ProfessionalType.Id == professionalTypeId);
            }

            if (!string.IsNullOrWhiteSpace(specialty) && specialty != "0")
            {
                query = query.Where(s => s.Specialty.Name == specialty);
            }

            // Filter by search term if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                // Assuming Professional has User.FirstName and User.LastName properties
                query = query.Where(s => (s.Professional.User.FirstName + " " + s.Professional.User.LastName).Contains(searchTerm));
            }

            // Filter by service type if provided
            if (!string.IsNullOrWhiteSpace(serviceType) && serviceType != "0")
            {
                // Assuming Service has boolean properties: IsOnline, IsPresencial, IsDomicilio
                switch (serviceType.ToLower())
                {
                    case "online":
                        query = query.Where(s => s.Online);
                        break;
                    case "presencial":
                        query = query.Where(s => s.Presential);
                        break;
                    case "domicilio":
                        query = query.Where(s => s.Home);
                        break;
                }
            }

            // Calculate the number of items to skip based on the current page and page size
            int skip = (page - 1) * pageSize;

            // Apply pagination to the query
            var pagedServices = await query.Skip(skip).Take(pageSize).ToListAsync();

            // Convert the paged services to DTOs
            var services = await GetServiceDtos(pagedServices);

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
            .Include(a => a.Address)
            .ToListAsync();

            List<Professional> professionalsUnfilteredList = professionalsUnfiltered;

            var professionals = professionalsUnfiltered.Where(p =>
                {
                    if (p.AddressId == null || string.IsNullOrEmpty(p.Address.Location)) return false;

                    var locationParts = p.Address.Location.Split(';');

                    if (locationParts.Length != 2) return false;

                    // Tenta analisar as partes de localização para doubles
                    if (!double.TryParse(locationParts[0], NumberStyles.Any, CultureInfo.GetCultureInfo("pt-PT"), out double lat)) return false;
                    if (!double.TryParse(locationParts[1], NumberStyles.Any, CultureInfo.GetCultureInfo("pt-PT"), out double lng)) return false;

                    return lat <= latNE && lat >= latSW && lng <= longNE && lng >= longSW;
                }).ToList();

            List<Professional> professionalsList = professionals;

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
                    Location = professional.Address.Location,
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
                Location = professional.Address != null ? professional.Address.Location : null,
                Description = professional.Description,
                ProfessionalType = professional.ProfessionalType.Name
            };

            return professionalDto;
        }
        #endregion
    }
}
