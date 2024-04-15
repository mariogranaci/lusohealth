namespace LusoHealthClient.Server.DTOs.Services
{
	/// <summary>
	/// DTO para atualizar o estado de um compromisso para "pago".
	/// </summary>
	public class UpdateAppointmentToPaidDto
    {
        public int AppointmentId { get; set; }
        public string? PaymentIntentId { get; set; }
    }
}
