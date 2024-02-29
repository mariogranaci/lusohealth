using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Professionals
{
	public class Appointment
	{
		[Key]
		public int Id { get; set; }

		public DateTime Timestamp { get; set; }

		public string Location { get; set; }

		public AppointmentType Type { get; set; }

		public string Description { get; set; }

		public AppointmentState State { get; set; }
		public int Duration { get; set; }

		[ForeignKey("Professional")]
		public string IdProfesional { get; set; }

		[ForeignKey("Patient")]
		public string IdPatient { get; set; }


	}
}
