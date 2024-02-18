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

        [Authorize]
        [HttpGet("get-patient")]
        public async Task<ActionResult<User>> GetUser()
        {
            var userIdClaim = User.FindFirst("NameIdentifier")?.Value;

            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"{claim.Type}: {claim.Value}");
            }

            await Console.Out.WriteLineAsync("Teste: " + userIdClaim);

            if (userIdClaim == null)
            {
                _logger.LogError("Email claim not found for the current user.");
                return BadRequest("Email claim not found for the current user.");
            }

            // Search for the user by email
            //var user = await _userManager.FindByEmailAsync(userEmailClaim?.Value);
            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                _logger.LogInformation($"User with email '{userIdClaim}' not found.");
                return NotFound();
            }

            return user;
        }

        /*[HttpGet("user")]
        public async Task<ActionResult<IEnumerable<User>>> GetMario()
        {
            return await _context.Users.ToListAsync();
        }*/
    }
}
