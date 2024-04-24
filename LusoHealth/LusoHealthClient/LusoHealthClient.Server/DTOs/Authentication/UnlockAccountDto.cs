using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class UnlockAccountDto
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string? Email { get; set; }
        [Required]
        public string? Token { get; set; }
    }
}
