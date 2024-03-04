using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.FeedbackAndReports
{
	public class Report
	{
		[Key]
		public int Id { get; set; }

		public DateTime Timestamp { get; set; }

		[ForeignKey("Patient")]
		public string IdPatient { get; set; }

		[ForeignKey("Professional")]
		public string IdProfesional { get; set; }

		public string Description { get; set; }

		public ReportState State { get; set; }
	}
}
