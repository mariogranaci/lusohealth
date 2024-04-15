using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.Users;

namespace LusoHealthClient.Server.DTOs.Services
{
	/// <summary>
	/// DTO para representar os detalhes de um serviço de saúde.
	/// </summary>
	public class ServicesDto
    {
        public int? ServiceId { get; set; }
        public int SpecialtyId { get; set; }
        public string? Specialty { get; set; }
        public double PricePerHour { get; set; }
        public bool Online { get; set; }
        public bool Presential { get; set; }
        public bool Home { get; set; }
        public ProfessionalDto? Professional { get; set; }
    }
}
