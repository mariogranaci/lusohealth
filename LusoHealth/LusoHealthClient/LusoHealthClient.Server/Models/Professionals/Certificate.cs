namespace LusoHealthClient.Server.Models.Professionals
{
    public class Certificate
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public Guid IdProfessional { get; set; }
    }
}
