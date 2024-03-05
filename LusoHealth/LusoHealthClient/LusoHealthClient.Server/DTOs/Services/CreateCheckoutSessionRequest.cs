using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Services
{
    public class CreateCheckoutSessionRequest
    {
        [Required]
        public String PriceId { get; set; }
    }
}
