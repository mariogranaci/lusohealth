using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
    public class UserProfileDto
    {
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Nif { get; set; }
        public string Telemovel { get; set; }
        public DateTime DataNascimento { get; set; }
        public char Genero { get; set; }
    }
}
