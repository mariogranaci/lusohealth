using LusoHealthClient.Server.Data;
using Microsoft.AspNetCore.SignalR;


namespace LusoHealthClient.Server.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(int chatId, string senderId, string message)
        {
            // Store message in DB (omitted for brevity)

            using (var scope = Context.GetHttpContext().RequestServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                // Now use dbContext as needed
            }

            // Broadcast message to all clients in the chat
            await Clients.Group(chatId.ToString()).SendAsync("ReceiveMessage", new { SenderId = senderId, Content = message, Timestamp = DateTime.UtcNow });
        }

        public async Task JoinChat(int chatId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
        }

        public async Task LeaveChat(int chatId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());
        }
    }
}
