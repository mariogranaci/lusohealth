using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
                var services = GetServiceDtos(servicesFromDB);

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
                var specialties = _context.Specialties.ToList();
                if (specialties == null) { return Task.FromResult<ActionResult<List<Specialty>>>(NotFound("Não foi possível encontrar as especialidades")); }
                return Task.FromResult<ActionResult<List<Specialty>>>(specialties);
            }
            catch (Exception)
            {
                return Task.FromResult<ActionResult<List<Specialty>>>(BadRequest("Não foi possível encontrar as especialidades. Tente novamente."));
            }
        }

        #region private helper methods
        private List<ServiceDto> GetServiceDtos(List<Service> services)
        {
            var serviceDtos = new List<ServiceDto>();
            foreach (var service in services)
            {
                var serviceDto = new ServiceDto
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
        #endregion
    }
}
