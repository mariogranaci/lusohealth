using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
    public class RelativeDto
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? Nif { get; set; }

        public DateTime? DataNascimento { get; set; }

        public char? Gender { get; set; }

        public string? Location {  get; set; }
    }
}
