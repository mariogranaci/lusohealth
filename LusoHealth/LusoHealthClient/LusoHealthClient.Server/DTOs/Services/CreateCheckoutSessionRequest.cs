using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Services
{
	// <summary>
	///(DTO) que representa um pedido para criar uma sessão de checkout.
	/// </summary>
	public class CreateCheckoutSessionRequest
    {
        public decimal Amount { get; set; }
        public int AppointmentId { get; set; }
        public string ServiceName { get; set; }
    }
}
