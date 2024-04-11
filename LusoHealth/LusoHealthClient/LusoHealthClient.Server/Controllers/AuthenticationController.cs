using Google.Apis.Auth;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Authentication;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using LusoHealthClient.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace LusoHealthClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

	/// <summary>
	/// Controlador para autenticação de utilizadores.
	/// </summary>
	public class AuthenticationController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthenticationController(JWTService jwtService,
            SignInManager<User> signInManager,
            UserManager<User> userManager,
            EmailService emailService,
            IConfiguration config,
            ApplicationDbContext context)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
            _context = context;
        }

		/// <summary>
		/// Método para atualizar o token de um utilizador.
		/// </summary>
		[Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return await CreateApplicationUserDto(user);
        }

		/// <summary>
		/// Método para fazer login de um utilizador.
		/// </summary>
		[HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Email ou password inválidos");
            if (user.IsBlocked) return Unauthorized("A sua conta encontra-se banida devido a utilizações indevidas");
            if (!user.EmailConfirmed) return Unauthorized("Necessita confirmar o seu email para efetuar autenticação");

            if (!CheckSuspensionValidityAsync(user))
            {
                await UnlockUserAsync(user);
            } else {
                string dataHora = GetCountdownString(user);
                return BadRequest($"A sua conta encontra-se suspensa durante {dataHora}");
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                int minutesNumber = (int) user.LockoutEnd.Value.Subtract(DateTime.UtcNow).TotalMinutes;
                string minutesString = minutesNumber == 1 ? $"minuto" : "minutos";
                string minutes = $"{minutesNumber} {minutesString}";
                if (minutesNumber <= 0) minutes = "menos de 1 minuto";
                return Unauthorized($"Demasiadas tentativas falhadas. Recupere a sua conta ou então aguarde {minutes}");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, true);
            if (!result.Succeeded) return Unauthorized("Email ou password inválidos");

            return await CreateApplicationUserDto(user);
        }

		/// <summary>
		/// Método para registar um novo utilizador.
		/// </summary>
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
                PhoneNumber = model.Telemovel.Trim().IsNullOrEmpty() ? null : model.Telemovel.Trim(),
                PasswordHash = model.Password.Trim(),
                PhoneNumberConfirmed = false,
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = null,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                UserName = model.Nif.Trim() + '_' + DateTime.Now.Millisecond,
                BirthDate = model.DataNascimento,
                DateCreated = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            try
            {
                if(model.TipoUser == 'P' && model.ProfessionalTypeId != null)
                {
                    var professional = new Professional
                    {
                        UserID = userToAdd.Id,
                        ProfessionalTypeId = (int) model.ProfessionalTypeId,
                    };
                    _context.Professionals.Add(professional);
                    await _userManager.AddToRoleAsync(userToAdd, SD.ProfessionalRole);
                    await _context.SaveChangesAsync();
                } else if(model.TipoUser == 'U')
                {
                    var patient = new Patient
                    {
                        UserID = userToAdd.Id
                    };
                    _context.Patients.Add(patient);
                    await _userManager.AddToRoleAsync(userToAdd, SD.PatientRole);
                    await _context.SaveChangesAsync();
                }
            } catch (Exception)
            {
                return BadRequest("Houve um problema a criar a sua conta. Tente novamente.");
            }

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

		/// <summary>
		/// Método para fazer login com Google.
		/// </summary>
		[HttpPost("login-with-google")]
        public async Task<ActionResult<UserDto>> LoginWithGoogle(LoginWithGoogleDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest("O email não está registado");
            if (user.IsBlocked) return Unauthorized("A sua conta encontra-se banida devido a utilizações indevidas");

            if (!CheckSuspensionValidityAsync(user))
            {
                if (user.IsSuspended)
                {
                    await UnlockUserAsync(user);
                }
            }
            else
            {
                string dataHora = GetCountdownString(user);
                return BadRequest($"A sua conta encontra-se suspensa durante {dataHora}");
            }

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

            if (await _userManager.IsLockedOutAsync(user))
            {
                int minutesNumber = (int) user.LockoutEnd.Value.Subtract(DateTime.Now).TotalMinutes;
                string minutesString = minutesNumber == 1 ? $"minuto" : "minutos";
                string minutes = $"{minutesNumber} {minutesString}";
                if (minutesNumber <= 0) minutes = "menos de 1 minuto";
                return Unauthorized($"Demasiadas tentativas falhadas. Recupere a sua conta ou então aguarde {minutes}");
            }

            return await CreateApplicationUserDto(user);
        }

		/// <summary>
		/// Método para registar com Google.
		/// </summary>
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
                PhoneNumber = model.Telemovel.Trim().IsNullOrEmpty() ? null : model.Telemovel.Trim(),
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

            try
            {
                if (model.TipoUser == 'P' && model.ProfessionalTypeId != null)
                {
                    var professional = new Professional
                    {
                        UserID = userToAdd.Id,
                        ProfessionalTypeId = (int) model.ProfessionalTypeId
                    };
                    _context.Professionals.Add(professional);
                    await _userManager.AddToRoleAsync(userToAdd, SD.ProfessionalRole);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    var patient = new Patient
                    {
                        UserID = userToAdd.Id
                    };
                    _context.Patients.Add(patient);
                    await _userManager.AddToRoleAsync(userToAdd, SD.PatientRole);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a criar a sua conta. Tente novamente.");
            }

            return await CreateApplicationUserDto(userToAdd);
        }

		/// <summary>
		/// Método para confirmar o email do utilizador.
		/// </summary>
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

		/// <summary>
		/// Método para reenviar o link de confirmação de email.
		/// </summary>
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

		/// <summary>
		/// Método para redefinir a password.
		/// </summary>
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

		/// <summary>
		/// Método para redefinir a password do utilizador.
		/// </summary>
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

        [HttpPost("recover-account")]
        public async Task<ActionResult> RecoverAccount(EmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest("Ocorreu um erro ao tentar iniciar a recuperação da conta");

            if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");

            try
            {
                if (await _userManager.IsLockedOutAsync(user))
                {
                    string dataHora = GetCountdownString(user);
                    if (user.IsSuspended) return BadRequest($"A sua conta encontra-se suspensa durante {dataHora}");


                    if (await SendRecoverAccountEmail(user))
                    {
                        return Ok(new JsonResult(new { title = "Email Enviado", message = "Verifique o seu email" }));
                    }
                    return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
                }
                return BadRequest("A sua conta não se encontra suspensa");
            }
            catch (Exception)
            {
                return BadRequest("Houve um problema a enviar o email. Tente mais tarde.");
            }
        }

        [HttpPut("unlock-account")]
        public async Task<IActionResult> UnlockAccount(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Este endereço de email ainda não foi registado");
            if (!user.EmailConfirmed) return BadRequest("O email ainda não foi confirmado. Confirme o seu email para poder recuperar a sua password");
            if (user.IsSuspended) return BadRequest("A sua conta encontra-se suspensa e não é recuperável");


            var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var isValidToken = await _userManager.VerifyUserTokenAsync(user, "Default", "UnlockUser", decodedToken);
            if (!isValidToken)
            {
                return BadRequest("Token inválido ou expirado.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow);

            return Ok(new JsonResult(new { title = "Conta desbloqueada", message = "A sua conta foi desbloquada com sucesso. Já pode fazer login com a sua conta" }));
        }

        /// <summary>
		/// Método para obter tipos de profissionais.
		/// </summary>
		[HttpGet("get-professional-types")]
        public async Task<ActionResult<List<ProfessionalType>>> GetProfessionalTypes()
        {
            try
            {
                var professionalTypes = await _context.ProfessionalTypes.ToListAsync();
                if (professionalTypes == null) return NotFound("Não foram encontrados tipos de profissionais");
                return professionalTypes;
            } catch (Exception)
            {
                return BadRequest("Houve um problema a obter os tipos de profissionais");
            }            
        }

        #region Private Helper Methods
        private async Task<UserDto> CreateApplicationUserDto(User user)
        {
            if (user == null) return null;
            return new UserDto
            {
                Name = user.FirstName + " " + user.LastName,
                JWT = await _jwtService.CreateJWT(user)
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

        private async Task<bool> SendRecoverAccountEmail(User user)
        {
            var token = await _userManager.GenerateUserTokenAsync(user, "Default", "UnlockUser");
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:RecoverAccountPath"]}?token={token}&email={user.Email}";

            var body = $"Olá {user.FirstName + " " + user.LastName}, <br/>" +
                $"Clique no link abaixo para desbloquear a sua conta: <br/>" +
                $"<a href='{url}'>Recuperar conta</a> <br/>" +
                "<p>Obrigado,</p> <br/>" +
                $"{_config["Email:ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Recuperar Conta", body);

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

        private bool CheckSuspensionValidityAsync(User user)
        {
            if (user.IsSuspended)
            {
                if (user.LockoutEnd > DateTime.UtcNow)
                {
                    return true;
                }
            }
            return false;
        }

        private async Task<bool> UnlockUserAsync(User user)
        {
            user.IsSuspended = false;
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded) return true;
            return false;
        }


        private string GetCountdownString(User user)
        {
            TimeSpan timeRemaining = user.LockoutEnd.Value - DateTime.UtcNow;
            string dataHora = "";

            // Construir a string condicionalmente
            List<string> parts = new List<string>();
            if (timeRemaining.Days > 0)
            {
                parts.Add($"{timeRemaining.Days} dias");
            }
            if (timeRemaining.Hours > 0 || timeRemaining.Days > 0)
            {
                parts.Add($"{timeRemaining.Hours} horas");
            }
            if (timeRemaining.Minutes > 0 || timeRemaining.Hours > 0 || timeRemaining.Days > 0)
            {
                parts.Add($"{timeRemaining.Minutes} minutos");
            }
            if (timeRemaining.TotalSeconds > 0 && parts.Count == 0) // Se não houver dias, horas ou minutos
            {
                parts.Add($"menos de 1 minuto");
            }


            dataHora = String.Join(", ", parts);
            if (parts.Count > 1)
            {
                int lastCommaIndex = dataHora.LastIndexOf(", ");
                if (lastCommaIndex >= 0)
                {
                    dataHora = dataHora.Substring(0, lastCommaIndex) + " e " + dataHora.Substring(lastCommaIndex + 2);
                }
            }
            return dataHora;
        }
        #endregion
    }
}
