using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Professionals
{
	/// <summary>
	/// Representa o tipo de profissional de saúde.
	/// </summary>
	public class ProfessionalType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
