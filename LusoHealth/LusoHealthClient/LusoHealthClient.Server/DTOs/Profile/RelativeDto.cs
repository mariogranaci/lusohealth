using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para representar um familiar de um paciente.
	/// </summary>
	public class RelativeDto
    {
        public int? Id { get; set; }
        public string Nome { get; set; }

        public string? Nif { get; set; }

        public DateTime DataNascimento { get; set; }

        public char Genero { get; set; }

        public string? Localizacao {  get; set; }
    }
}
