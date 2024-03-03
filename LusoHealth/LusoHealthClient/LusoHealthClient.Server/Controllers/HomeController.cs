using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using ServicesDto = LusoHealthClient.Server.DTOs.Services.ServicesDto;
using ServiceProfileDto = LusoHealthClient.Server.DTOs.Profile.ServiceDto;

namespace LusoHealthClient.Server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class HomeController : ControllerBase
	{
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

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
                    ProfessionalInfo = new UserProfileDto {FirstName = user.FirstName, LastName = user.LastName },
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

        [HttpGet("get-services")]
        public async Task<List<ServicesDto>> GetServices()
        {
            var servicesFromDB = await _context.Services.Include(s => s.Specialty).Include(d => d.Professional).ThenInclude(a => a.ProfessionalType).ToListAsync();
            var services = await GetServiceDtos(servicesFromDB);

            return services;
        }

        [HttpPost("get-professionals-on-location")]
        public async Task<ActionResult<List<ProfessionalDto>>> GetProfessionalsOnLocation(LocationDto locationDto)
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
                    var locationParts = p.Location.Split(';');
                    var lat = double.Parse(locationParts[0]);
                    var lng = double.Parse(locationParts[1]);
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
