using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Administration;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using static System.Runtime.InteropServices.JavaScript.JSType;
using ReviewDto = LusoHealthClient.Server.DTOs.Profile.ReviewDto;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public ProfileController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
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
                Provider = user.Provider,
            };

            return userProfileDto;
        }

        [HttpGet("get-user/{id}")]
        public async Task<ActionResult<UserProfileDto>> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

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
                Provider = user.Provider,
            };

            return userProfileDto;
        }

        [HttpGet("get-professional-info")]
        public async Task<ActionResult<ProfessionalDto>> GetProfessionalProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            return await GetProfessionalInfo(userIdClaim);
        }

        [HttpGet("get-professional-info/{id}")]
        public async Task<ActionResult<ProfessionalDto>> GetProfessionalProfile(string id)
        {
            var response = await GetProfessionalInfo(id);

            if (response.Result is NotFoundResult) { return NotFound("Não foi possível encontrar o profissional"); }

            return response.Value;
        }

        private async Task<ActionResult<ProfessionalDto>> GetProfessionalInfo(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

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
                .ThenInclude(s => s.Specialty)
                .Include(r => r.Patient)
                .ThenInclude(p => p.User)
                .Where(r => r.Service.IdProfessional == user.Id && r.State != ReviewState.Deleted)
                .ToListAsync();
            var reviews = GetReviewDtos(reviewsFromDB);

            var professional = await _context.Professionals.Include(pt => pt.ProfessionalType).Include(a => a.Address).FirstOrDefaultAsync(p => p.UserID == user.Id);
            //var certificates = GetCertificateDtos(professional.Certificates);
            //var professionalType = await _context.ProfessionalTypes.FirstOrDefaultAsync(pt => pt.Id == professional.ProfessionalTypeId);

            if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

            var professionalDto = new ProfessionalDto
            {
                ProfessionalInfo = userProfileDto,
                Services = services,
                Certificates = certificates,
                Reviews = reviews,
                Location = professional.Address != null ? professional.Address.Location : null,
                Address = professional.Address != null ? professional.Address.AddressName : null,
                Description = professional.Description,
                ProfessionalType = professional.ProfessionalType.Name
            };

            return professionalDto;
        }

        [HttpPatch("update-address")]
        public async Task<ActionResult> UpdateAddress(LocationDto model)
        {

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

                var professional = await _context.Professionals.Include(a => a.Address).FirstOrDefaultAsync(p => p.UserID == user.Id);
                if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

                if (model.Location.IsNullOrEmpty() || model.Address.IsNullOrEmpty())
                {
                    return BadRequest("A localização não é válida");
                }
                else
                {
                    string[] latLon = model.Location.Split(";");
                    if (latLon.Length != 2)
                    {
                        return BadRequest("A localização não é válida");
                    }
                    else
                    {
                        if (!double.TryParse(latLon[0], out double lat) || !double.TryParse(latLon[1], out double lon))
                        {
                            return BadRequest("A localização não é válida");
                        }
                    }
                }
                
                if (professional.AddressId != null)
                {
                    var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == professional.AddressId);
                    if (address == null) { return NotFound("Não foi possível encontrar a morada"); }

                    address.Location = model.Location;
                    address.AddressName = model.Address;

                    _context.Addresses.Update(address);
                }
                else
                {
                    var newAddress = new Address
                    {
                        Location = model.Location,
                        AddressName = model.Address
                    };

                    await _context.Addresses.AddAsync(newAddress);
                    professional.AddressId = newAddress.Id;
                    _context.Professionals.Update(professional);
                }

                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { title = "Morada Alterada", message = "A sua morada foi alterada com sucesso." }));
            }
            catch (Exception)
            {
                return BadRequest("Não foi possivel alterar a morada. Tente Novamente.");
            }
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
                if (user.Provider == "google")
                {
                    user.FirstName = model.FirstName.Trim();
                    user.LastName = model.LastName.Trim();
                    user.PhoneNumber = model.Telemovel.IsNullOrEmpty() ? null : model.Telemovel.Trim();
                    user.Nif = model.Nif.Trim();
                    user.Gender = model.Genero != null ? (char)model.Genero : user.Gender;
                } else
                {
                    user.FirstName = model.FirstName.Trim();
                    user.LastName = model.LastName.Trim();
                    user.Email = model.Email.ToLower().Trim();
                    user.NormalizedEmail = model.Email.ToLower().Trim();
                    user.PhoneNumber = model.Telemovel.IsNullOrEmpty() ? null : model.Telemovel.Trim();
                    user.Nif = model.Nif.Trim();
                    user.Gender = model.Genero != null ? (char)model.Genero : user.Gender;
                }

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
            }
            catch (Exception)
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

        [HttpGet("filter-reviews-by-service/{id}")]
        public async Task<ActionResult<List<ReviewDto>>> FilterReviewsByService(int id)
        {
            try
            {

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

                /*var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }*/

                var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == userIdClaim);
                if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

                var reviews = await GetFilteredReviewsByService(id, userIdClaim);

                if (reviews == null) { return NotFound("Não foi possível encontrar as reviews"); }

                return reviews;

            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as reviews. Tente novamente.");
            }
        }

        [HttpGet("filter-reviews-by-service/{idSpecialty}/{idProfessional}")]
        public async Task<ActionResult<List<ReviewDto>>> FilterReviewsByService(int idSpecialty, string idProfessional)
        {
            try
            {
                var professional = await _context.Professionals.FirstOrDefaultAsync(p => p.UserID == idProfessional);
                if (professional == null) { return NotFound("Não foi possível encontrar o profissional"); }

                var reviews = await GetFilteredReviewsByService(idSpecialty, idProfessional);

                if (reviews == null) { return NotFound("Não foi possível encontrar as reviews"); }

                return reviews;

            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as reviews. Tente novamente.");
            }
        }

        private async Task<ActionResult<List<ReviewDto>>> GetFilteredReviewsByService(int idSpecialty, string idProfessional)
        {
            if (idSpecialty <= 0)
            {
                var reviewsFromDB = await _context.Reviews
                    .Include(r => r.Service)
                    .ThenInclude(s => s.Specialty)
                    .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                    .Where(r => r.Service.IdProfessional == idProfessional)
                    .ToListAsync();
                if (reviewsFromDB == null) { return NotFound("Não foi possível encontrar as reviews"); }
                var reviews = GetReviewDtos(reviewsFromDB);
                return reviews;
            }
            else
            {
                var reviewsFromDB = await _context.Reviews
                    .Include(r => r.Service)
                    .ThenInclude(s => s.Specialty)
                    .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                    .Where(r => r.Service.IdProfessional == idProfessional && r.Service.IdSpecialty == idSpecialty)
                    .ToListAsync();
                if (reviewsFromDB == null) { return NotFound("Não foi possível encontrar as reviews"); }
                var reviews = GetReviewDtos(reviewsFromDB);
                return reviews;
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
            if (relative == null) { return NotFound("Familiar não encontrado"); }

            try
            {
                _context.Relatives.Remove(relative);
                await _context.SaveChangesAsync();
                return Ok(new JsonResult(new { message = "Familiar excluído com sucesso" }));
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao excluir o familiar");
            }
        }


        [HttpPost("add-relative")]
        public async Task<ActionResult> AddRelative(RelativeDto relativeDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

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

                return Ok(new JsonResult(new { message = "Familiar adicionado com sucesso" }));
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao adicionar o familiar");
            }
        }

        [HttpPut("update-relative/{relativeId}")]
        public async Task<ActionResult> UpdateRelative(RelativeDto relativeDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

                var relative = await _context.Relatives.FirstOrDefaultAsync(r => r.Id == relativeDto.Id && r.IdPatient == user.Id);
                if (relative == null) return NotFound("Familiar não encontrado");

                relative.Name = relativeDto.Nome;
                relative.Nif = relativeDto.Nif;
                relative.BirthDate = relativeDto.DataNascimento;
                relative.Gender = relativeDto.Genero;
                relative.Location = relativeDto.Localizacao;

                _context.Relatives.Update(relative);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { message = "Familiar atualizado com sucesso" }));
            }
            catch (Exception)
            {
                return BadRequest("Erro ao atualizar familiar");
            }
        }

        [HttpPut("update-picture")]
        [DisableRequestSizeLimit]
        public async Task<ActionResult> UpdatePicture()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");
                var oldImagePath = user.ProfilePicPath;

                var file = Request.Form.Files[0];
                var folderName = Path.Combine("Uploads", "ProfilePic");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);

                if (file.Length > 0)
                {
                    /*var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');*/
                    var fileName = userId + Path.GetExtension(file.FileName);
                    var fullPath = Path.Combine(pathToSave, fileName);
                    var dbPath = Path.Combine(folderName, fileName);

                    if (!string.IsNullOrEmpty(oldImagePath) && System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }


                    user.ProfilePicPath = fullPath;
                    var result = await _userManager.UpdateAsync(user);


                    return Ok(new JsonResult(new { title = "Perfil Alterado", message = "A sua foto de perfil foi alterada com sucesso." }));
                }
                else
                {
                    return BadRequest("Não foi possível alterar a foto de perfil. Tente Novamente.");
                }
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível alterar a foto de perfil.");
            }
        }

        [HttpGet("get-profile-picture")]
        public async Task<IActionResult> GetProfilePicture()

        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

                var filePath = user.ProfilePicPath;

                if (string.IsNullOrEmpty(filePath))
                    return BadRequest("File path cannot be empty");

                if (filePath.StartsWith("https"))
                {
                    using (var httpClient = new HttpClient())
                    {
                        var response = await httpClient.GetByteArrayAsync(filePath);
                        var memoryGoogle = new MemoryStream(response);

                        // Determine content type based on file extension (assuming it's an image)
                        var contentTypeGoogle = GetContentType(filePath);
                        var fileNameGoogle = Path.GetFileName(new Uri(filePath).LocalPath);

                        return File(memoryGoogle, contentTypeGoogle, fileNameGoogle);
                    }
                }


                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath);
                if (!System.IO.File.Exists(fullPath))
                    return NotFound("File not found");

                var memory = new MemoryStream();
                using (var stream = new FileStream(fullPath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                // Determine content type based on file extension
                var contentType = GetContentType(fullPath);
                var fileName = Path.GetFileName(fullPath);

                return File(memory, contentType, fileName);
            }
            catch (Exception)
            {
                return BadRequest("Failed to download image. Please try again.");
            }
        }


        private string GetContentType(string filePath)
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var contentType))
            {
                contentType = "application/octet-stream"; // Default to binary data if content type cannot be determined
            }

            return contentType;
        }




        [HttpPost("add-report")]
        public async Task<ActionResult> AddReport(ReportDto reportDto)
        {

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var report = new Report
                {
                    Timestamp = DateTime.Now,
                    IdPatient = user.Id,
                    IdProfesional = reportDto.IdProfesional,
                    Description = reportDto.Description,
                    State = ReportState.Pending
                };

                _context.Report.Add(report);
                await _context.SaveChangesAsync();
                return Ok(new JsonResult(new { message = "Report enviado com sucesso." }));
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao reportar.");
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

        [HttpPost("add-review")]
        public async Task<ActionResult> AddReview(AddReviewDto reviewDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

                var reviewExists = await _context.Reviews.AnyAsync(r => r.IdPatient == user.Id && r.Service.IdSpecialty == reviewDto.IdSpecialty);

                if (reviewExists) return BadRequest("Já adicionou uma review para este serviço");

                var review = new Review
                {
                    IdPatient = user.Id,
                    IdService = reviewDto.IdService,
                    Stars = reviewDto.Stars,
                    Description = reviewDto.Description
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return Ok(new JsonResult(new { message = "A sua review foi adicionada com sucesso" }));
            }
            catch (Exception)
            {
                return BadRequest("Houve um erro ao adicionar a review. Tente novamente");
            }
        }

        [HttpPost("upload-pdf")]
        [DisableRequestSizeLimit]
        public async Task<ActionResult> UploadPdf()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

                var file = Request.Form.Files[0];
                var folderName = Path.Combine("Uploads", "Certificates");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                if (file.Length > 0)
                {
                    var fileName = userId + "divider" + ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    var fullPath = Path.Combine(pathToSave, fileName);
                    var dbPath = Path.Combine(folderName, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }
                    var certificate = new Certificate
                    {
                        Name = fileName,
                        Path = fullPath,
                        IdProfessional = user.Id
                    };

                    _context.Certificates.Add(certificate);
                    await _context.SaveChangesAsync();

                    return Ok(new JsonResult(new { title = "PDF Uploaded", message = "PDF file uploaded successfully." }));
                }
                else
                {
                    return BadRequest("Failed to upload PDF. Please try again.");
                }
            }
            catch (Exception)
            {
                return BadRequest("Failed to upload PDF. Please try again.");
            }
        }

        [HttpGet("get-pdfs")]
        public async Task<ActionResult<List<CertificateDto>>> GetPdfs()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador");

                var response = await GetPdfs(userId);

                if (response.Result is NotFoundResult) { return NotFound("Não foi possível encontrar o profissional"); }

                return response.Value;
            }
            catch (Exception)
            {
                return BadRequest("Failed to retrieve PDFs. Please try again.");
            }
        }

        [HttpGet("get-pdfs/{id}")]
        public async Task<ActionResult<List<CertificateDto>>> GetPdfsById(string id)
        {
            try
            {
                var response = await GetPdfs(id);

                if (response.Result is NotFoundResult) { return NotFound("Não foi possível encontrar o profissional"); }

                return response.Value;
            }
            catch (Exception)
            {
                return BadRequest("Failed to retrieve PDFs. Please try again.");
            }
        }

        private async Task<ActionResult<List<CertificateDto>>> GetPdfs(string id) 
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Não foi possível encontrar o utilizador");

            var certificates = await _context.Certificates
                .Where(c => c.IdProfessional == user.Id)
                .ToListAsync();

            List<CertificateDto> certificateDtos = new List<CertificateDto>();
            foreach (var certificate in certificates)
            {
                CertificateDto certificateDto = new CertificateDto
                {
                    CertificateId = certificate.Id,
                    Name = certificate.Name.Split("divider")[1],
                    Path = certificate.Path
                };
                certificateDtos.Add(certificateDto);
            }

            return certificateDtos;
        }

        [HttpDelete("delete-pdf/{id}")]
        public async Task<ActionResult> DeletePdf(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador");

                var certificate = await _context.Certificates.FirstOrDefaultAsync(r => r.Id == id && r.IdProfessional == userId); ;
                if (certificate == null) return NotFound("Certificate not found");

                _context.Certificates.Remove(certificate);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(certificate.Path) && System.IO.File.Exists(certificate.Path))
                {
                    System.IO.File.Delete(certificate.Path);
                }

                return Ok(new JsonResult(new { title = "PDF Deleted", message = "PDF file deleted successfully." }));
            }
            catch (Exception)
            {
                return BadRequest("Failed to delete PDF. Please try again.");
            }
        }

        [HttpGet("download-pdf")]
        public async Task<IActionResult> DownloadPdf(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                    return BadRequest("File path cannot be empty");

                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath);
                if (!System.IO.File.Exists(fullPath))
                    return NotFound("File not found");

                var memory = new MemoryStream();
                using (var stream = new FileStream(fullPath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                var contentType = "application/pdf";
                var fileName = Path.GetFileName(fullPath);
                return File(memory, contentType, fileName);
            }
            catch (Exception)
            {
                return BadRequest("Failed to download PDF. Please try again.");
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
                    PatientPicture = review.Patient.User.ProfilePicPath ?? "/assets/images/Perfil/profileImage.jpg",
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

