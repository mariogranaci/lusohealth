using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para confirmar o email do utilizador.
	/// </summary>
	public class ConfirmEmailDto
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

    }
}
