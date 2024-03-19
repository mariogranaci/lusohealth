namespace LusoHealthClient.Server.DTOs.Agenda
{
    public class DeleteSlotsDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ServiceId { get; set; }
    }
}