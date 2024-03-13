namespace LusoHealthClient.Server.DTOs.Services
{
    public class UpdateAppointmentToPaidDto
    {
        public int AppointmentId { get; set; }
        public string? PaymentIntentId { get; set; }
    }
}
