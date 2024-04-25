using LusoHealthClient.Server.DTOs.Profile;

namespace LusoHealthClient.Server.DTOs.Services
{
    public class BestServicesDto
    {
        public int ServiceId { get; set; }
        public int SpecialtyId { get; set; }
        public int ProfessionalTypeId { get; set; }
        public string Specialty { get; set; }
        public double PricePerHour { get; set; }
        public ProfessionalDto Professional { get; set; }
        public double Rating { get; set; }
    }
}
