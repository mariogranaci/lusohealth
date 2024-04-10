using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Services
{
	/// <summary>
	/// Representa um agendamento de serviço, como uma consulta ou exame médico.
	/// </summary>
	public class Appointment
    {
        [Key]
        public int? Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }
        public AppointmentType? Type { get; set; }
        public string? Description { get; set; }
        public AppointmentState? State { get; set; }
        public int? Duration { get; set; }
        public string? PaymentIntentId { get; set; }

        [ForeignKey("Professional")]
        public string? IdProfesional { get; set; }

        [ForeignKey("Patient")]
        public string? IdPatient { get; set; }

		[ForeignKey("Service")]
        public int? IdService { get; set; }

		#region Navigation Properties
		public Professional Professional { get; set; }

        public Patient Patient { get; set; }

        public Service Service { get; set; }
		#endregion
	}
}
