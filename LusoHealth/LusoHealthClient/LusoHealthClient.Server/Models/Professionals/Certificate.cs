using LusoHealthClient.Server.Models.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.Models.Professionals
{
    public class Certificate
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        [ForeignKey("Professional")]
        public string IdProfessional { get; set; }

        #region Navigation Properties
        public virtual Professional Professional { get; set; }
        #endregion
    }
}   
