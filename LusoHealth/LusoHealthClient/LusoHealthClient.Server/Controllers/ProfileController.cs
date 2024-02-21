using System;
using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                _logger.LogError("Email claim not found for the current user.");
                return BadRequest("Email claim not found for the current user.");
            }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                _logger.LogInformation($"User with email '{userIdClaim}' not found.");
                return NotFound();
            }

            UserProfileDto userProfileDto = new UserProfileDto {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Nif = user.Nif,
                Telemovel = user.PhoneNumber,
                DataNascimento = user.BirthDate,
                Genero = user.Gender,
                Picture = user.ProfilePicPath
            };

            return userProfileDto;
        }

		[HttpPut("update-user-info")]
		public async Task<ActionResult> UpdateUserInfo(UserProfileDto model)
		{
			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");
			if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");

			try
			{
				user.FirstName = model.FirstName.Trim();
				user.LastName = model.LastName.Trim();
				user.Email = model.Email.ToLower().Trim();
				user.PhoneNumber = model.Telemovel.Trim();
				user.Nif = model.Nif.Trim();
				user.Gender = model.Genero;

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
			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");

			try
			{
				if (model.NewPassword != model.ConfirmNewPassword)
					return BadRequest("As novas passwords não condizem.");

				var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

				if (result.Succeeded)
					return Ok(new JsonResult(new { title = "Password Alterada", message = "A sua password foi alterada com sucesso." }));
				return BadRequest("Falha ao atualizar a password. Tente novamente.");
			}
			catch (Exception)
			{
				return BadRequest("Falha ao atualizar a password. Tente novamente.");
			}
		}

	}
}

