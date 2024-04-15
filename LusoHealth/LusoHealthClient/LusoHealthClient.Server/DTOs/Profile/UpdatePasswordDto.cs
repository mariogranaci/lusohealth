using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para atualização de senha do utilizador.
	/// </summary>
	public class UpdatePasswordDto
	{
		[Required(ErrorMessage = "Introduza a password atual.")]
		[StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
		public string CurrentPassword { get; set; }

		[Required(ErrorMessage = "Introduza uma nova password.")]
		[StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
		public string NewPassword { get; set; }

		[Required(ErrorMessage = "Confirme a nova password.")]
		[StringLength(50, MinimumLength = 8, ErrorMessage = "A nova password deve conter entre {2} e {1} caracteres")]
		public string ConfirmNewPassword { get; set; }
	}
}
