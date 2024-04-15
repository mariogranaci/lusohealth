namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para representar informações básicas do utilizador.
	/// </summary>
	public class UserDto
    {
        public string? Name { get; set; }
        public string? JWT { get; set; }
    }
}
