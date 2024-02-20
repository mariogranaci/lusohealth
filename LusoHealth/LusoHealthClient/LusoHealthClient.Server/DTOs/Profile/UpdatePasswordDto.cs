using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
	public class UpdatePasswordDto
	{
		[EmailAddress(ErrorMessage = "Email inválido")]
		public string Email { get; set; }
		public string CurrentPassword { get; set; }

		[StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
		public string NewPassword { get; set; }
		[StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
		public string ConfirmNewPassword { get; set; }
	}
}
