using LusoHealthClient.Server.Models.Professionals;

namespace LusoHealthClient.Server.DTOs.Services
{
	public class AppointmentDto
	{
		public int? Id { get; set; }
		public DateTime Timestamp { get; set; }
		public string? Location { get; set; }
		public AppointmentType Type { get; set; }
		public string? Description { get; set; }
		public AppointmentState State { get; set; }
		public int? Duration { get; set; }
		public string IdPatient { get; set; }
		public string IdProfesional { get; set; }
	
	}
}
