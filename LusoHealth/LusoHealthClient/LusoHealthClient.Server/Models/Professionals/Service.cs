namespace LusoHealthClient.Server.Models.Professionals
{
    public class Service
    {
        public double PricePerHour { get; set; }
        public bool Online { get; set; }
        public bool Presential { get; set; }
        public bool Home { get; set; }
        public Guid IdProfessional { get; set; }
        public int IdSpecialty { get; set; }
    }
}
