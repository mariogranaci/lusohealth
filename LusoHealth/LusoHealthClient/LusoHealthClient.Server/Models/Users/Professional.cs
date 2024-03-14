using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Users
{
    public class Professional
    {
        [Key, ForeignKey("User")]
        public string UserID { get; set; }
        public string? Location { get; set; }
        public List<Service>? Services { get; set; }
        [ForeignKey("ProfessionalType")]
        public int ProfessionalTypeId { get; set; }
        public List<Review>? Reviews { get; set; }
        public string? Description { get; set; }
        public List<Certificate>? Certificates { get; set; }
        public List<Appointment>? Agenda { get; set; }
        public List<AvailableSlot>? AvailableSlots { get; set; }

        #region Navigation Properties
        public User User { get; set; }
        public ProfessionalType ProfessionalType { get; set; }
        #endregion
    }
}
