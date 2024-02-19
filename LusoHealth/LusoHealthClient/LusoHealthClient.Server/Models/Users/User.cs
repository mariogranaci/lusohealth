using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Users
{
    public class User : IdentityUser
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public char Gender { get; set; }
        [Required]
        public string Nif { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsBlocked { get; set; }
        public string? ProfilePicPath { get; set; }
        [Required]
        public char UserType { get; set; }
        [Required]
        public DateTime BirthDate { get; set; }
        public string? Provider { get; set; }

    }
}
