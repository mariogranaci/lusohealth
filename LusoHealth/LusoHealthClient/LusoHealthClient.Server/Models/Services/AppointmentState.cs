namespace LusoHealthClient.Server.Models.Services
{
	/// <summary>
	/// Representa o estado de um agendamento de serviço.
	/// </summary>
	public enum AppointmentState
	{
        PaymentPending,
        Pending,
		Scheduled,
		InProgress,
		Done,
		Canceled
	}

}
