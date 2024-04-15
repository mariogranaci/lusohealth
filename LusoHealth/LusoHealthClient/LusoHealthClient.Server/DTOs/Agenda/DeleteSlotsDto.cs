namespace LusoHealthClient.Server.DTOs.Agenda
{
	/// <summary>
	///(DTO) para representar os dados necessários para excluir slots de disponibilidade.
	/// </summary>
	public class DeleteSlotsDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ServiceId { get; set; }
    }
}