using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Services
{
    public class CreateCheckoutSessionRequest
    {
        public decimal Amount { get; set; }
        public int AppointmentId { get; set; }
        public string ServiceName { get; set; }
    }
}
