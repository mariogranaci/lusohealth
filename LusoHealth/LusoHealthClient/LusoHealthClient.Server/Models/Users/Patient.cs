using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Users
{
    public class Patient
    {
        [Key, ForeignKey("User")]
        public string UserID { get; set; }
        public string? Agenda { get; set; }
        public List<Relative>? FamilyAggregate { get; set; }

        #region Navigation Properties
        public User User { get; set; }
        #endregion
    }
}
