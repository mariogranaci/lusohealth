using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Professionals
{
    public class ProfessionalType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
