namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para representar um certificado.
	/// </summary>
	public class CertificateDto
    {
        public int CertificateId { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
    }
}
