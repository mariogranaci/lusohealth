namespace LusoHealthClient.Server.DTOs.Profile
{
    public class PatientDto
    {
        public string? UserId { get; set; }
        public UserProfileDto? User { get; set; }
        public List<RelativeDto>? FamilyMembers { get; set; }
    }
}
