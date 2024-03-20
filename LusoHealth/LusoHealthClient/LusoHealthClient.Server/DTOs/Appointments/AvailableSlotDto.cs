namespace LusoHealthClient.Server.DTOs.Appointments
{
    public class AvailableSlotDto
    {
        public int? Id { get; set; }
        public DateTime? Start { get; set; }
        public int? SlotDuration { get; set; }
        public int? IdService { get; set; }
        public string? AppointmentType { get; set; }
        public bool? IsAvailable { get; set; }
        public int? AppointmentId { get; set; }
    }
}
