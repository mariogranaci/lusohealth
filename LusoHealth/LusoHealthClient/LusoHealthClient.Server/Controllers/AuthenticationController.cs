using Google.Apis.Auth;
using LusoHealthClient.Server.DTOs.Authentication;
using LusoHealthClient.Server.Models.Authentication;
using LusoHealthClient.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace LusoHealthClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthenticationController(JWTService jwtService,
            SignInManager<User> signInManager,
            UserManager<User> userManager,
            EmailService emailService,
            IConfiguration config)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
        }

        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateApplicationUserDto(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
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
                return BadRequest($"O email já se encontra em uso");
            }

            if (model.Password != model.ConfirmarPassword)
            {
                return BadRequest($"As passwords não condizem");
            }

            var userToAdd = new User
            {
                FirstName = model.FirstName.Trim(),
                LastName = model.LastName.Trim(),
                Email = model.Email.ToLower().Trim(),
                NormalizedEmail = model.Email.ToLower().Trim(),
                Gender = model.Genero,
                Nif = model.Nif.Trim(),
                UserType = model.TipoUser,
                PhoneNumber = model.Telemovel.Trim(),
                PasswordHash = model.Password.Trim(),
                PhoneNumberConfirmed = false,
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = null,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                UserName = model.Nif.Trim() + '_' + DateTime.Now.Millisecond,
                BirthDate = model.DataNascimento
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            try
            {
                if (await SendConfirmEmailAsync(userToAdd))
                {
                    return Ok(new JsonResult(new { title = "Conta Criada", message = "A sua conta foi criada com sucesso. Por favor, confirme o seu endereço de email" }));
                }
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
        }

        [HttpPost("login-with-google")]
        public async Task<ActionResult<UserDto>> LoginWithGoogle(LoginWithGoogleDto model)
        {
            if (model.Provider.Equals("google"))
            {
                try
                {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Não foi possível continuar com o Google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Não foi possível continuar com o Google");
                }

            }
            else
            {
                return BadRequest("Provedor Inválido");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest("O email não está registado");

            return CreateApplicationUserDto(user);
        }

        [HttpPost("register-with-google")]
        public async Task<ActionResult<UserDto>> RegisterWithGoogle(RegisterWithGoogleDto model)
        {
            if (model.Provider.Equals("google"))
            {
                try
                {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Não foi possível continuar com o Google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Não foi possível continuar com o Google");
                }

            }
            else
            {
                return BadRequest("Provedor Inválido");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null) return Unauthorized("O email já está a ser utilizado.");

            var userToAdd = new User
            {

                FirstName = model.FirstName.Trim(),
                LastName = model.LastName.Trim(),
                Email = model.Email.ToLower().Trim(),
                NormalizedEmail = model.Email.ToLower().Trim(),
                Gender = model.Genero,
                Nif = model.Nif.Trim(),
                UserType = model.TipoUser,
                PhoneNumber = model.Telemovel.Trim(),
                PhoneNumberConfirmed = false,
                EmailConfirmed = true,
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = model.ProfilePicPath,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                UserName = model.UserId,
                BirthDate = model.DataNascimento,
                Provider = model.Provider,

            };

            var result = await _userManager.CreateAsync(userToAdd);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return CreateApplicationUserDto(userToAdd);
        }

        [HttpPut("confirm-email")]
        public async Task<ActionResult> ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");

            if (user.EmailConfirmed) return Ok(new JsonResult(new { title = "Email Confirmado", message = "O email já foi confirmado. Faça login na sua conta" }));

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if (result.Succeeded)
                    return Ok(new JsonResult(new { title = "Email Confirmado", message = "O seu email foi confirmado com sucesso. Faça login na sua conta" }));
                return BadRequest("Token inválido. Tente novamente");
            }
            catch (Exception)
            {
                return BadRequest("Token inválido. Tente novamente");
            }
        }

        [HttpPost("resend-email-confirmation-link/{email}")]
        public async Task<ActionResult> ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Email inválido");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");

            if (user.EmailConfirmed) return BadRequest("O email já foi confirmado. Faça login na sua conta");

            try
            {
                if (await SendConfirmEmailAsync(user))
                {
                    return Ok(new JsonResult(new { title = "Email Enviado", message = "O email de confirmação foi reenviado com sucesso" }));
                }
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(EmailDto model)
        {
            var email = model.Email;
            if (string.IsNullOrEmpty(email)) return BadRequest("Email inválido");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");

            if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");

            try
            {
                if (await SendForgotPasswordEmail(user))
                {
                    return Ok(new JsonResult(new { title = "Email Enviado", message = "Verifique o seu email" }));
                }
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
        }

        [HttpPut("reset-password")]
        public async Task<ActionResult> ResetPassword(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");
            if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                if (model.NewPassword != model.ConfirmarPassword) return BadRequest($"As passwords não condizem");

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
                if (result.Succeeded)
                    return Ok(new JsonResult(new { title = "Password Alterada", message = "A sua password foi alterada com sucesso. Faça login na sua conta" }));
                return BadRequest("Token inválido. Tente novamente");
            }
            catch (Exception)
            {
                return BadRequest("Token inválido. Tente novamente");
            }
        }

        #region Private Helper Methods
        private UserDto CreateApplicationUserDto(User user)
        {
            if (user == null) return null;
            return new UserDto
            {
                Name = user.FirstName + " " + user.LastName,
                JWT = _jwtService.CreateJWT(user)
            };
        }

        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }

        private async Task<bool> SendConfirmEmailAsync(User user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ConfirmEmailPath"]}?token={token}&email={user.Email}";

            var body = $"Olá {user.FirstName + " " + user.LastName}, <br/>" +
                $"Por favor, confirme o seu email clicando no link abaixo: <br/>" +
                $"<a href='{url}'>Confirmar email</a> <br/>" +
                "<p>Obrigado,</p> <br/>" +
                $"{_config["Email:ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Confirme o seu email", body);

            return await _emailService.SendEmailAsync(emailSend);
        }


        private async Task<bool> SendForgotPasswordEmail(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";

            var body = $"Olá {user.FirstName + " " + user.LastName}, <br/>" +
                $"Clique no link abaixo para recuperar a sua password: <br/>" +
                $"<a href='{url}'>Recuperar password</a> <br/>" +
                "<p>Obrigado,</p> <br/>" +
                $"{_config["Email:ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Recuperar Password", body);

            return await _emailService.SendEmailAsync(emailSend);
        }

        private async Task<bool> GoogleValidatedAsync(string accessToken, string userId)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken);
            if (!payload.Audience.Equals(_config["Google:ClientId"]))
            {
                return false;
            }
            if (!payload.Issuer.Equals("accounts.google.com") && !payload.Issuer.Equals("https://accounts.google.com"))
            {
                return false;
            }
            if (payload.ExpirationTimeSeconds == null)
            {
                return false;
            }
            DateTime now = DateTime.Now.ToUniversalTime();
            DateTime expiration = DateTimeOffset.FromUnixTimeSeconds((long)payload.ExpirationTimeSeconds).DateTime;
            if (now > expiration)
            {
                return false;
            }
            if (!payload.Subject.Equals(userId))
            {
                return false;
            }
            return true;
        }
        #endregion
    }
}
