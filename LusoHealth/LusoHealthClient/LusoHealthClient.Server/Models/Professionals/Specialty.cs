namespace LusoHealthClient.Server.Models.Professionals
{
    public class Specialty
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ProfessionalType ProfessionalType { get; set; }
        public int TimesScheduled { get; set; }
    }
}
