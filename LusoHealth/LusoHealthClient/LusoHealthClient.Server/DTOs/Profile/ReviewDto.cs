using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Profile
{
    public class ReviewDto
    {
        public string IdPatient { get; set; }
        public string PatientName { get; set; }
        public string? PatientPicture { get; set; }
        public int IdService { get; set; }
        public string ServiceName { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
    }
}
