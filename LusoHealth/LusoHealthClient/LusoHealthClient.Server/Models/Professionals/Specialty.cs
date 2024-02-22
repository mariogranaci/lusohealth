using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Professionals
{
    public class Specialty
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public int TimesScheduled { get; set; }
        [ForeignKey("ProfessionalType")]
        public int ProfessionalTypeId { get; set; }

        #region Navigation Properties
        public ProfessionalType ProfessionalType { get; set; }
        #endregion
    }
}
