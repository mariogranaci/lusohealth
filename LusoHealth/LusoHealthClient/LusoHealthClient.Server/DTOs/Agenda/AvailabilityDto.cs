namespace LusoHealthClient.Server.DTOs.Agenda
{
    public class AvailabilityDto
    {
        public int? Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? ServiceId { get; set; }
        public int? SlotDuration { get; set; }
        public string? Type { get; set; }
    }
}
