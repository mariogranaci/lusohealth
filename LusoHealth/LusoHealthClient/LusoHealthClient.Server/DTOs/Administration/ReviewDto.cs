using LusoHealthClient.Server.Models.FeedbackAndReports;

namespace LusoHealthClient.Server.DTOs.Administration
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public string IdPatient { get; set; }
        public int IdService { get; set; }
        public DateTime Timestamp { get; set; }
        public ReviewState? State { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
    }
}
