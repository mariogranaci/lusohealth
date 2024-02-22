using Microsoft.AspNetCore.Components.Routing;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Users
{
    public class Relative
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public char Gender { get; set; }
        public string? Nif { get; set; }
        public string BirthDate { get; set; }
        public string? Location { get; set; }
        public string IdPatient { get; set; }

        #region Navigation Properties
        public virtual Patient Patient { get; set; }
        #endregion

    }
}
