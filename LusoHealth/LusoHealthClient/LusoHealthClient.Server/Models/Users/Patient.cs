using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using LusoHealthClient.Server.Models.Services;

namespace LusoHealthClient.Server.Models.Users
{
	/// <summary>
	/// Representa um paciente no sistema.
	/// </summary>
	public class Patient
    {
        [Key, ForeignKey("User")]
        public string UserID { get; set; }
        //public List<Appointment>? Agenda { get; set; }
        public List<Relative>? FamilyAggregate { get; set; }

        #region Navigation Properties
        public User User { get; set; }
        #endregion
    }
}
