using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para informações de login.
	/// </summary>
	public class LoginDto
    {
        [Required(ErrorMessage = "Email obrigatório")]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
