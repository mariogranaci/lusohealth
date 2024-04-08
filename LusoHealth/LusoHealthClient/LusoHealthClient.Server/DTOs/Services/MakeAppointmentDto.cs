namespace LusoHealthClient.Server.DTOs.Services
{
	/// <summary>
	///(DTO) para fazer um agendamento.
	/// </summary>
	public class MakeAppointmentDto
	{
		public int? ServiceId { get; set; }
		public int SpecialtyId { get; set; }
		public string? Specialty { get; set; }
		public string ProfessionalName { get; set; }
		public string Category { get; set; }
		public bool Online { get; set; }
		public bool Presential { get; set; }
		public bool Home { get; set; }
		public double PricePerHour { get; set; }
		public string[]? Availability { get; set; }
	}
}
