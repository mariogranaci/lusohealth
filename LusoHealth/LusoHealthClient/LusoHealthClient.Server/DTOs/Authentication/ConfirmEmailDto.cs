using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class ConfirmEmailDto
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

    }
}
