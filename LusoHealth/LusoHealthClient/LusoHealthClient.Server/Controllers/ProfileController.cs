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

            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

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

            var servicesFromDB = await _context.Services.Include(s => s.Specialty).Where(s => s.IdProfessional == user.Id).ToListAsync();
            var services = GetServiceDtos(servicesFromDB);

            var certificatedFromDB = await _context.Certificates.Where(c => c.IdProfessional == user.Id).ToListAsync();
            var certificates = GetCertificateDtos(certificatedFromDB);

            var reviewsFromDB = await _context.Reviews
                .Include(r => r.Service)
                .Include(r => r.Patient)
                .ThenInclude(p => p.User)
                .Where(r => r.Service.IdProfessional == user.Id)
                .ToListAsync();
            var reviews = GetReviewDtos(reviewsFromDB);
            
            var professional = await _context.Professionals.Include(pt => pt.ProfessionalType).FirstOrDefaultAsync(p => p.UserID == user.Id);
            //var certificates = GetCertificateDtos(professional.Certificates);
            //var professionalType = await _context.ProfessionalTypes.FirstOrDefaultAsync(pt => pt.Id == professional.ProfessionalTypeId);

            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

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

        [HttpPatch("update-description")]
        public async Task<ActionResult> UpdateDescription(DescriptionDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

            try
            {
                professional.Description = model.Description;
                _context.Professionals.Update(professional);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { title = "Descrição Alterada", message = "A sua descrição foi alterada com sucesso." }));
            }
            catch (Exception)
            {
                return BadRequest("Não foi possivel alterar a descrição. Tente Novamente.");
            }
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

        [HttpPost("add-service")]
        public async Task<ActionResult> AddService(ServiceDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

            var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == model.SpecialtyId);
            if (specialty == null) { return NotFound("Não foi possível encontrar a especialidade"); }

            bool serviceExists = await _context.Services.AnyAsync(s => s.IdProfessional == professional.UserID && s.IdSpecialty == specialty.Id);
            if (serviceExists) { return BadRequest("Já existe um serviço com esta especialidade."); }

            try
            {
                var service = new Service
                {
                    IdProfessional = professional.UserID,
                    IdSpecialty = specialty.Id,
                    PricePerHour = model.PricePerHour,
                    Online = model.Online,
                    Presential = model.Presential,
                    Home = model.Home
                };

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { title = "Serviço Adicionado", message = "O seu serviço foi adicionado com sucesso." }));
            } catch (Exception)
            {
                return BadRequest("Não foi possível adicionar o serviço. Tente novamente.");
            }
        }

        [HttpPut("update-service")]
        public async Task<ActionResult> UpdateService(ServiceDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

            var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == model.ServiceId);
            if (service == null) { return NotFound("Não foi possível encontrar o serviço"); }

            var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == model.SpecialtyId);
            if (specialty == null) { return NotFound("Não foi possível encontrar a especialidade"); }

            try
            {
                service.IdSpecialty = specialty.Id;
                service.PricePerHour = model.PricePerHour;
                service.Online = model.Online;
                service.Presential = model.Presential;
                service.Home = model.Home;

                _context.Services.Update(service);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { title = "Serviço Atualizado", message = "O seu serviço foi atualizado com sucesso." }));
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível atualizar o serviço. Tente novamente.");
            }
        }

        [HttpDelete("delete-service/{id}")]
        public async Task<ActionResult> DeleteService(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

            var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == id);
            if (service == null) { return NotFound("Não foi possível encontrar o serviço"); }

            try
            {
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { title = "Serviço Removido", message = "O seu serviço foi removido com sucesso." }));
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível remover o serviço. Tente novamente.");
            }
        }

        [HttpPost("filter-reviews-by-service")]
        public async Task<ActionResult<List<ReviewDto>>> FilterReviewsByService(int idService)
        {
            try
            {

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

                var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
                if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

                if (idService <= 0)
                {
                    var reviewsFromDB = await _context.Reviews
                        .Include(r => r.Service)
                        .Include(r => r.Patient)
                        .ThenInclude(p => p.User)
                        .Where(r => r.Service.IdProfessional == user.Id)
                        .ToListAsync();
                    if (reviewsFromDB == null) { return NotFound("Não foi possível encontrar as reviews"); }
                    var reviews = GetReviewDtos(reviewsFromDB);
                    return reviews;
                } else
                {
                    var reviewsFromDB = await _context.Reviews
                        .Include(r => r.Service)
                        .Include(r => r.Patient)
                        .ThenInclude(p => p.User)
                        .Where(r => r.Service.IdProfessional == user.Id && r.IdService == idService)
                        .ToListAsync();
                    if (reviewsFromDB == null) { return NotFound("Não foi possível encontrar as reviews"); }
                    var reviews = GetReviewDtos(reviewsFromDB);
                    return reviews;
                }

            } catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as reviews. Tente novamente.");
            }

        }
        [HttpGet("get-relatives")]
        public async Task<ActionResult<List<RelativeDto>>> GetRelatives()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var relatives = await _context.Relatives
            .Where(r => r.IdPatient == user.Id)
            .ToListAsync();

            List<RelativeDto> relativeDtos = new List<RelativeDto>();

            foreach (var relative in relatives)
            {
                RelativeDto relativeDto = new RelativeDto
                {
                    Id = relative.Id,
                    Nome = relative.Name,
                    Nif = relative.Nif,
                    DataNascimento = relative.BirthDate,
                    Genero = relative.Gender,
                    Localizacao = relative.Location
                };

                relativeDtos.Add(relativeDto);
            }

            foreach (var dto in relativeDtos)
            {
                Console.WriteLine($"Name: {dto.Nome}, Nif: {dto.Nif}, BirthDate: {dto.DataNascimento}, Gender: {dto.Genero}, Location: {dto.Localizacao}");
            }

            return relativeDtos;
        }

        [HttpDelete("delete-relative/{relativeId}")]
        public async Task<ActionResult> DeleteRelative(int relativeId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            var relative = await _context.Relatives.FirstOrDefaultAsync(r => r.Id == relativeId && r.IdPatient == user.Id);
            if (relative == null) { return NotFound("Parente não encontrado"); }

            try
            {
                _context.Relatives.Remove(relative);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Parente excluído com sucesso" });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocorreu um erro ao excluir o parente");
            }
        }


        [HttpPost("add-relative")]
        public async Task<ActionResult> AddRelative(RelativeDto relativeDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("User ID not found in claims.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("User not found.");

                var relative = new Relative
                {
                    Name = relativeDto.Nome,
                    Nif = relativeDto.Nif,
                    BirthDate = relativeDto.DataNascimento,
                    Gender = relativeDto.Genero,
                    Location = relativeDto.Localizacao,
                    IdPatient = user.Id 
                };

                _context.Relatives.Add(relative);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Relative added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding relative: {ex.Message}");
            }
        }

        [HttpPut("update-picture")]
        public async Task<ActionResult> UpdatePicture(UserProfileDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

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

        [HttpGet("get-specialties")]
        public async Task<ActionResult<List<Specialty>>> GetSpecialties()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            try
            {
                var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == user.Id);
                if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

                var specialties = _context.Specialties.Where(p => p.ProfessionalTypeId == professional.ProfessionalTypeId).ToList();
                if (specialties == null) { return NotFound("Não foi possível encontrar as especialidades"); }
                return specialties;
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as especialidades. Tente novamente.");
            }
        }
        
        [HttpPut("update-relative/{relativeId}")]
        public async Task<ActionResult> UpdateRelative(RelativeDto relativeDto)
        {
            try
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

                var relative = await _context.Relatives.FirstOrDefaultAsync(r => r.Id == relativeDto.Id && r.IdPatient == user.Id);

                if (relative == null)
                {
                    return NotFound("Parente não encontrado");
                }

                relative.Name = relativeDto.Nome;
                relative.Nif = relativeDto.Nif;
                relative.BirthDate = relativeDto.DataNascimento;
                relative.Gender = relativeDto.Genero;
                relative.Location = relativeDto.Localizacao;

                _context.Relatives.Update(relative);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Parente atualizado com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao atualizar parente: {ex.Message}");
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
                Console.WriteLine(review);
                ReviewDto reviewDto = new ReviewDto
                {
                    IdPatient = review.IdPatient,
                    PatientName = review.Patient.User.FirstName + " " + review.Patient.User.LastName,
                    PatientPicture = review.Patient.User.ProfilePicPath,
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
