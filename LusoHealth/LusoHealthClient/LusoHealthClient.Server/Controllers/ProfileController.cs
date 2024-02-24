using System;
using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize]
	[Route("api/[controller]")]
	[ApiController]
	public class ProfileController : ControllerBase
	{

		private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(ApplicationDbContext context, UserManager<User> userManager, ILogger<ProfileController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet("get-user")]
        public async Task<ActionResult<UserProfileDto>> GetUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                return BadRequest("Não foi possível encontrar o utilizador");
            }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            UserProfileDto userProfileDto = new UserProfileDto {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Nif = user.Nif,
                Telemovel = user.PhoneNumber,
                DataNascimento = user.BirthDate,
                Genero = user.Gender,
                Picture = user.ProfilePicPath,
				Provider = user.Provider,
            };

            return userProfileDto;
        }

        [HttpGet("get-professional-info")]
        public async Task<ActionResult<ProfessionalDto>> GetProfessionalProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                return BadRequest("Não foi possível encontrar o utilizador");
            }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            UserProfileDto userProfileDto = new UserProfileDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Nif = user.Nif,
                Telemovel = user.PhoneNumber,
                DataNascimento = user.BirthDate,
                Genero = user.Gender,
                Picture = user.ProfilePicPath,
                Provider = user.Provider
            };

            var servicesFromDB = await _context.Services.Where(s => s.IdProfessional == user.Id).ToListAsync();
            var services = GetServiceDtos(servicesFromDB);

            //var certificatedFromDB = await _context.Certificates.Where(c => c.IdProfessional == user.Id).ToListAsync();
            //var certificates = GetCertificateDtos(certificatedFromDB);
            
            var reviewsFromDB = await _context.Reviews
                .Include(r => r.Service)
                .Where(r => r.Service.IdProfessional == user.Id)
                .ToListAsync();
            var reviews = GetReviewDtos(reviewsFromDB);
            
            var professional = await _context.Professionals.Include(p => p.Certificates).FirstOrDefaultAsync(p => p.UserID == user.Id);
            var certificates = GetCertificateDtos(professional.Certificates);


            var professionalDto = new ProfessionalDto
            {
                ProfessionalInfo = userProfileDto,
                Services = services,
                Certificates = certificates,
                Reviews = reviews,
                Location = professional.Location,
                Description = professional.Description,
                ProfessionalType = professional.ProfessionalType.Name
            };

            return professionalDto;
        }

        [HttpPut("update-user-info")]
		public async Task<ActionResult> UpdateUserInfo(UserProfileDto model)
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                return BadRequest("Não foi possível encontrar o utilizador");
            }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }
			
            if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");

			try
			{
				user.FirstName = model.FirstName.Trim();
				user.LastName = model.LastName.Trim();
				user.Email = model.Email.ToLower().Trim();
                user.NormalizedEmail = model.Email.ToLower().Trim();
				user.PhoneNumber = model.Telemovel.Trim().IsNullOrEmpty() ? null : model.Telemovel.Trim();
				user.Nif = model.Nif.Trim();
				user.Gender = model.Genero != null ? (char) model.Genero : user.Gender;


                var result = await _userManager.UpdateAsync(user);

				if (result.Succeeded)
					return Ok(new JsonResult(new { title = "Perfil Alterado", message = "Os seus dados foram alterados com sucesso." }));
				return BadRequest("Não foi possivel alterar os seus dados.Tente Novamente.");
			}
			catch (Exception)
			{
				return BadRequest("Não foi possivel alterar os seus dados.Tente Novamente.");
			}
		}

		[HttpPut("update-password")]
		public async Task<ActionResult> UpdatePassword(UpdatePasswordDto model)
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (userIdClaim == null)
			{
				return BadRequest("Não foi possível encontrar o utilizador");
			}

			var user = await _userManager.FindByIdAsync(userIdClaim);

			if (user == null)
			{
				return NotFound("Não foi possível encontrar o utilizador");
			}

			try
			{
				var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, model.CurrentPassword);
				if (!isCurrentPasswordValid)
                {
					return BadRequest("A password atual está incorreta.");
				}
				else if (model.NewPassword != model.ConfirmNewPassword)
				{
					return BadRequest("As novas passwords não condizem.");
				}

				var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

				if (result.Succeeded)
				{
					return Ok(new JsonResult(new { title = "Password Alterada", message = "A sua password foi alterada com sucesso." }));
				}
				return BadRequest("Falha ao atualizar a password. Tente novamente.");
			}
			catch (Exception)
			{
				return BadRequest("Falha ao atualizar a password. Tente novamente.");
			}
		}

		[HttpPut("update-picture")]
		public async Task<ActionResult> UpdatePicture(UserProfileDto model)
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


			if (userIdClaim == null)
			{
				return BadRequest("Não foi possível encontrar o utilizador");
			}

			var user = await _userManager.FindByIdAsync(userIdClaim);

			if (user == null)
			{
				return NotFound("Não foi possível encontrar o utilizador");
			}

			try
			{
				user.ProfilePicPath = model.Picture;
				var result = await _userManager.UpdateAsync(user);

				if (result.Succeeded)
					return Ok(new JsonResult(new { title = "Perfil Alterado", message = "A sua foto de perfil foi alterada com sucesso." }));
				return BadRequest("Não foi possivel alterar a foto de perfil.Tente Novamente.");

			}
			catch (Exception)
			{
				return BadRequest("Não foi possivel alterar a foto de perfil.Tente Novamente.");
			}
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

        private List<CertificateDto> GetCertificateDtos(List<Certificate> certificates)
        {
            var certificateDtos = new List<CertificateDto>();
            foreach (var certificate in certificates)
            {
                var certificateDto = new CertificateDto
                {
                    CertificateId = certificate.Id,
                    Name = certificate.Name,
                    Path = certificate.Path
                };
                certificateDtos.Add(certificateDto);
            }
            return certificateDtos;
        }

        private List<ReviewDto> GetReviewDtos(List<Review> reviews)
        {
            var reviewDtos = new List<ReviewDto>();
            foreach (var review in reviews)
            {
                ReviewDto reviewDto = new ReviewDto
                {
                    IdPatient = review.IdPatient,
                    PatientName = review.Patient.User.FirstName + " " + review.Patient.User.LastName,
                    IdService = review.IdService,
                    ServiceName = review.Service.Specialty.Name,
                    Stars = review.Stars,
                    Description = review.Description
                };
                reviews.Add(review);
            }
            return reviewDtos;
        }
        #endregion
    }
}

