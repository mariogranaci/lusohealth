using System;
using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.Users;
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
    }
}
