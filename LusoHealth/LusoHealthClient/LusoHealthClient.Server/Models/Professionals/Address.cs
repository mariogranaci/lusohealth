using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.Models.Professionals
{
    public class Address
    {
        [Key]
        public int Id { get; set; }
        public string? Location { get; set; }
        public string? AddressName { get; set; }
    }
}
