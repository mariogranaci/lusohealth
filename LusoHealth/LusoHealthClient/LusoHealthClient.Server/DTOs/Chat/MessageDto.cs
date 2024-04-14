namespace LusoHealthClient.Server.DTOs.Chat
{
    public class MessageDto
    {
        public int? Id { get; set; }
        public string? UserId { get; set; }
        public string? Text { get; set; }
        public bool? IsImage { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? Timestamp { get; set; }
        public int? ChatId { get; set; }
    }
}
