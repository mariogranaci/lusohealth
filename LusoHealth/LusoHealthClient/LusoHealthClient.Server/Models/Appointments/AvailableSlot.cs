using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Appointments
{
    public class AvailableSlot
    {
        [Key]
        public int Id { get; set; }
        public DateTime Start { get; set; }
        public int SlotDuration { get; set; }
        [ForeignKey("Service")]
        public int IdService { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public bool IsAvailable { get; set; }
        public int? AppointmentId { get; set; }

        #region Navigation Properties
        public Service Service { get; set; }
        public Appointment Appointment { get; set; }
        #endregion
    }
}
