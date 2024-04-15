using Microsoft.AspNetCore.Components.Routing;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Users
{
	/// <summary>
	/// Representa um familiar de um paciente no sistema.
	/// </summary>
	public class Relative
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public char Gender { get; set; }
        public string? Nif { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Location { get; set; }
        public string IdPatient { get; set; }

        #region Navigation Properties
        public virtual Patient Patient { get; set; }
        #endregion
    }
}
