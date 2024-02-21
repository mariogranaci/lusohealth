using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;

namespace LusoHealthClient.Server.Models.Users
{
    public class Professional
    {
        public Guid UserID { get; set; }
        public string? Location { get; set; }
        public string? Agenda { get; set; }
        public List<Specialty>? Specialties { get; set; }
        public ProfessionalType? Type { get; set; }
        public Dictionary<Service, List<Review>>? Reviews { get; set; }
        public List<Certificate>? Certificates { get; set; }
    }
}
