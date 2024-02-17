using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
	public class EditarPerfilDto
	{

		
		[MaxLength(50, ErrorMessage = "Não pode introduzir mais de {1} caracteres")]
		[MinLength(3, ErrorMessage = "O nome tem um mínimo de {1} caracteres")]
		public string FirstName { get; set; }

		
		[MaxLength(50, ErrorMessage = "Não pode introduzir mais de {1} caracteres")]
		[MinLength(3, ErrorMessage = "O apelido tem um mínimo de {1} caracteres")]
		public string LastName { get; set; }

		
		[EmailAddress(ErrorMessage = "Email inválido")]
		public string Email { get; set; }


		[StringLength(9, MinimumLength = 9, ErrorMessage = "NIF deve ter 9 dígitos")]
		public string Nif { get; set; }

		[OptionalStringLength(MinLength = 9, MaxLength = 9, ErrorMessage = "O telemóvel deve ter 9 dígitos")]

		public string Telemovel { get; set; }


		
		public char Genero { get; set; }


	}
}
