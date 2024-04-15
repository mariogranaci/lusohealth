using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para informações de login usando o Google.
	/// </summary>
	public class LoginWithGoogleDto
    {
        
        [Required]
        public string AccessToken { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Provider { get; set; }
    }
}
