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
                //FirstName = user.FirstName,
                //LastName = user.LastName,
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

			if (user == null)
			{
				_logger.LogInformation($"User with email '{userIdClaim}' not found.");
				return NotFound();
			}

			// Atualizar informações do usuário com base nos dados fornecidos
			user.nif = userProfileUpdateDto.nif;
			user.PhoneNumber = userProfileUpdateDto.Telemovel;
			user.BirthDate = userProfileUpdateDto.DataNascimento;
			user.Gender = userProfileUpdateDto.Genero;

			// Salvar as alterações no banco de dados
			var result = await _userManager.UpdateAsync(user);

			if (result.Succeeded)
			{
				return Ok("User information updated successfully.");
			}
			else
			{
				_logger.LogError("Failed to update user information.");
				return BadRequest("Failed to update user information.");
			}
		}
	}
}

