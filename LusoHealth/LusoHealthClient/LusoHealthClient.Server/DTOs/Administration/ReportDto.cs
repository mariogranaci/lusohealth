using LusoHealthClient.Server.Models.FeedbackAndReports;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.DTOs.Administration
{
	/// <summary>
	/// (DTO) para reports.
	/// </summary>
	public class ReportDto
	{
		public int? Id { get; set; }

		public DateTime? Timestamp { get; set; }

        public string? IdPatient { get; set; }

		public string? IdProfesional { get; set; }

		public string? Description { get; set; }

		public ReportState? State { get; set; }
	}
}
