using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }
        [Required]
        public string Token { get; set; }
        [Required(ErrorMessage = "Introduza uma password")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
        public string NewPassword { get; set; }
        [Required(ErrorMessage = "Confirme a password")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "A password deve conter entre {2} e {1} caracteres")]
        public string ConfirmarPassword { get; set; }
    }
}
