using LusoHealthClient.Server.DTOs.Authentication;
using LusoHealthClient.Server.Models.Authentication;
using LusoHealthClient.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto model)
        {
            if (await CheckEmailExistsAsync(model.Email)) 
            {
                return BadRequest($"{model.Email} já se encontra em uso, ta ai o ip dele 293.451.863.");
            }

            if (model.Password == model.ConfirmarPassword) 
            {
                return BadRequest($"As passwords têm que condizer.");
            }

            var userToAdd = new User
            {
                Name = model.FirstName.ToUpper() + " " + model.LastName.ToUpper(),
                Email = model.Email.ToLower(),
                NormalizedEmail = model.Email.ToLower(),
                Gender = model.Genero,
                Nif = model.Nif,
                UserType = model.TipoUser,
                PhoneNumber = model.Telemovel,
                PasswordHash = model.Password,
                EmailConfirmed = true,
                PhoneNumberConfirmed = false,
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = null,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (result.Succeeded) return BadRequest(result.Errors);

            return Ok("Conta criada com sucesso.");
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

        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }
        #endregion
    }
}
