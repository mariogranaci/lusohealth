namespace LusoHealthClient.Server.DTOs.Services
{
	/// <summary>
	///(DTO) que representa os limites geográficos de uma área.
	/// </summary>
	public class BoundsDto
    {
        public double LatitudeNorthEast { get; set; }
        public double LongitudeNorthEast { get; set; }
        public double LatitudeSouthWest { get; set; }
        public double LongitudeSouthWest { get; set; }
    }
}
