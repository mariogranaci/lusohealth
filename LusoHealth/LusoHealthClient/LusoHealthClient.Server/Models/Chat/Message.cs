using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LusoHealthClient.Server.Models.Users;

namespace LusoHealthClient.Server.Models.Chat
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("User")]
        public string UserId { get; set; }
        public string? Text { get; set; }
        public bool IsImage { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime Timestamp { get; set; }
        [ForeignKey("Chat")]
        public int ChatId { get; set; }

        #region Navigation Properties
        public User User { get; set; }
        #endregion
    }
}
