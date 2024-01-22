using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Authentication
{
    public class User : IdentityUser
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public char Gender { get; set; }
        [Required]
        public string Nif { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsBlocked { get; set; }
        public string? ProfilePicPath { get; set; }
        [Required]
        public char UserType { get; set; }
    }
}
