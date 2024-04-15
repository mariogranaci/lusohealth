namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para representar uma especialidade médica.
	/// </summary>
	public class SpecialtyDto
    {
        public int? Id { get; set; }
        public string Nome { get; set; }

        public int timesScheduled { get; set; }

        public int professionalTypeId { get; set; }

    }
}
