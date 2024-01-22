using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email obrigatório")]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
