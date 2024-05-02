using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Chat;
using LusoHealthClient.Server.Models.Chat;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinChat(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveChat(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task SendMessage(string groupName, int chatId, string userId, string message, bool isImage, string imageUrl)
        {
            var timestamp = DateTime.UtcNow;

            var newMessage = new Message
            {
                UserId = userId,
                Text = message,
                IsImage = isImage,
                ImageUrl = imageUrl,
                Timestamp = ConvertUtcToPortugal(DateTime.UtcNow),
                ChatId = chatId
            };

            _context.Message.Add(newMessage);
            await _context.SaveChangesAsync();

            var messageDto = new MessageDto
            {
                UserId = newMessage.UserId,
                Text = newMessage.Text,
                IsImage = newMessage.IsImage,
                ImageUrl = newMessage.ImageUrl,
                Timestamp = newMessage.Timestamp,
                ChatId = newMessage.ChatId
            };

            await Clients.Group(groupName).SendAsync("ReceiveMessage", messageDto);
        }

        private static DateTime ConvertUtcToPortugal(DateTime utcDateTime)
        {
            TimeZoneInfo portugalTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");
            DateTime portugalDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, portugalTimeZone);
            return portugalDateTime;
        }

        public async Task SendChatUpdate(string groupName, int chatId)
        {
            try
            {
                var chat = await _context.Chat.FirstOrDefaultAsync(c => c.Id == chatId);

                if (chat == null)
                {
                    return;
                }

                chat.IsActive = !chat.IsActive;

                _context.Chat.Update(chat);
                await _context.SaveChangesAsync();

                var chatDto = new ChatDto
                {
                    Id = chat.Id,
                    AppointmentId = chat.AppointmentId,
                    IsActive = chat.IsActive,
                };

                await Clients.Group(groupName).SendAsync("ReceiveChatUpdate", chatDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

        }
    }
}
