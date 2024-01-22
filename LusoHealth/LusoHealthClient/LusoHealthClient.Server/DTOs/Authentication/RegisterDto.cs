using System.ComponentModel.DataAnnotations;
using System.Drawing;

namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class RegisterDto
    {
        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "First name must be at least {2}, and maximum {1} characters")]
        public string FirstName { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Last name must be at least {2}, and maximum {1} characters")]
        public string LastName { get; set; }

        [Required]
        [RegularExpression("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", ErrorMessage ="Invalid email address")]
        public string Email { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 8, ErrorMessage = "Password must be at least {2}, and maximum {1} characters")]
        public string Password { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 8, ErrorMessage = "Password must be at least {2}, and maximum {1} characters")]
        public string ConfirmarPassword { get; set; }

        [Required]
        [StringLength(9, MinimumLength = 9, ErrorMessage = "NIF must be 9 characters")]
        public string Nif { get; set; }

        [Required]
        [StringLength(9, MinimumLength = 9, ErrorMessage = "Phone number must be 9 characters")]
        public string Telemovel { get; set; }

        [Required]
        public DateTime DataNascimento{ get; set; }

        [Required]
        public char Genero { get; set; }

        [Required]
        public char TipoUser { get; set; }
    }
}
