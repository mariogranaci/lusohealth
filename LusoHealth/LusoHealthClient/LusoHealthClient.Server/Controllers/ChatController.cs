using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Chat;
using LusoHealthClient.Server.Hubs;
using LusoHealthClient.Server.Models.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("get-chat/{chatId}")]
        public async Task<ActionResult<ChatDto>> GetChat(int chatId)
        {
            var chat = await _context.Chat
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);

            if (chat == null)
            {
                return NotFound();
            }

            var chatDto = new ChatDto
            {
                Id = chat.Id,
                AppointmentId = chat.AppointmentId,
                IsActive = chat.IsActive,
                Messages = chat.Messages.Select(m => new MessageDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Text = m.Text,
                    IsImage = m.IsImage,
                    ImageUrl = m.ImageUrl,
                    Timestamp = m.Timestamp,
                    ChatId = m.ChatId
                }).ToList()
            };

            return chatDto;
        }

        // generate new chat
        [HttpPost("generate-chat")]
        public async Task<ActionResult<ChatDto>> GenerateChat(ChatDto chatDto)
        {
            var chat = new Chat
            {
                /*AppointmentId = chatDto.AppointmentId,
                IsActive = chatDto.IsActive*/
            };

            _context.Chat.Add(chat);
            await _context.SaveChangesAsync();

            chatDto.Id = chat.Id;

            return chatDto;
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> PostMessage(MessageDto message)
        {
            /*_context.Message.Add(message);
            await _context.SaveChangesAsync();*/

            // Use SignalR to send the message to clients in real-time
            await _hubContext.Clients.Group(message.ChatId.ToString()).SendAsync("ReceiveMessage", message);

            return Ok();
        }

        [HttpGet("get-messages/{chatId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessagesForChat(int chatId)
        {
            return await _context.Message.Where(m => m.ChatId == chatId).ToListAsync();
        }
    }
}
