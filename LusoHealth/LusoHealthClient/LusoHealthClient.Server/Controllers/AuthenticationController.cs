using LusoHealthClient.Server.DTOs.Authentication;
using LusoHealthClient.Server.Models;
using LusoHealthClient.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LusoHealthClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;

        public AuthenticationController(JWTService jwtService,
            SignInManager<User> signInManager,
            UserManager<User> userManager)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateApplicationUserDto(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login (LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Email ou password inválidos");
            if (user.EmailConfirmed == false) return Unauthorized("Necessita confirmar o seu email para efetuar autenticação");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return Unauthorized("Email ou password inválidos");

            return CreateApplicationUserDto(user);
        }

        #region Private Helper Methods
        private UserDto CreateApplicationUserDto(User user)
        {
            return new UserDto
            {
                Name = user.Name,
                JWT = _jwtService.CreateJWT(user)
            };
        }
        #endregion
    }
}
