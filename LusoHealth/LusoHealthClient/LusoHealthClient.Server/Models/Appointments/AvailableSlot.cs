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
        public int SlotDuation { get; set; }
        [ForeignKey("Service")]
        public int IdService { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public bool IsAvailable { get; set; }
    }
}
