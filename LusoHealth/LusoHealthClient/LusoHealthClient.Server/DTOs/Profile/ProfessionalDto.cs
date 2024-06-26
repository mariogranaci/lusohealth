﻿namespace LusoHealthClient.Server.DTOs.Profile
{
	///<summary>
	///(DTO) para representar um profissional de saúde.
	/// </summary>
	public class ProfessionalDto
    {
        public UserProfileDto? ProfessionalInfo { get; set; }
        public List<ServiceDto>? Services { get; set; }
        public List<CertificateDto>? Certificates { get; set; }
        public List<ReviewDto>? Reviews { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? ProfessionalType { get; set; }
    }
}
