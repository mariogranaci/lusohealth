using LusoHealthClient.Server.Models.FeedbackAndReports;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para representar uma avaliação de serviço feita por um paciente.
	/// </summary>
	public class ReviewDto
    {
        public string IdPatient { get; set; }
        public string PatientName { get; set; }
        public string? PatientPicture { get; set; }
        public int IdService { get; set; }
        public bool Deleted { get; set; }
        public string ServiceName { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
        public int? Id {  get; set; }

        public ReviewState? State { get; set; }
    }
}
