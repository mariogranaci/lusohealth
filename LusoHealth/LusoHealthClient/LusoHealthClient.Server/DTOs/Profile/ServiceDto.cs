namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para representar um serviço oferecido por um profissional de saúde.
	/// </summary>
	public class ServiceDto
    {
        public int? ServiceId { get; set; }
        public int SpecialtyId { get; set; }
        public string? Specialty { get; set; }
        public double PricePerHour { get; set; }
        public bool Online { get; set; }
        public bool Presential { get; set; }
        public bool Home { get; set; }

    }
}
