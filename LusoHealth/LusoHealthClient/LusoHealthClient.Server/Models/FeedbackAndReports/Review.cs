namespace LusoHealthClient.Server.Models.FeedbackAndReports
{
    public class Review
    {
        public int Stars { get; set; }
        public string Description { get; set; }
        public Guid IdProfessional { get; set; }
        public Guid IdPatient { get; set; }
    }
}
