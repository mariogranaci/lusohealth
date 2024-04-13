using System.ComponentModel.DataAnnotations.Schema;

namespace LusoHealthClient.Server.DTOs.Chat
{
    public class ChatDto
    {
        public int? Id { get; set; }
        public int? AppointmentId { get; set; }
        public bool? IsActive { get; set; }
        public List<MessageDto>? Messages { get; set; }
    }
}
