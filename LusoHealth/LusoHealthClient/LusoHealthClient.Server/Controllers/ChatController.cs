﻿using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Chat;
using LusoHealthClient.Server.Hubs;
using LusoHealthClient.Server.Models.Chat;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
        private readonly UserManager<User> _userManager;

        public ChatController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("add-message")]
        public async Task<ActionResult> PostMessage([FromBody] Message message)
        {
            _context.Message.Add(message);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("get-messages/{chatId}")]
        public async Task<ActionResult<List<Message>>> GetMessages(int chatId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var chat = await _context.Chat.FirstOrDefaultAsync(c => c.Id == chatId);
                if (chat == null) return NotFound("Não foi possível encontrar a conversa.");

                var isUserInChat = await _context.Appointment.AnyAsync(a => a.Id == chat.AppointmentId && (a.IdPatient == user.Id || a.IdProfesional == user.Id));
                if (!isUserInChat) return BadRequest("Não tem permissão para aceder a esta conversa.");

                var messages = await _context.Message.Where(m => m.ChatId == chatId).ToListAsync();
                return Ok(messages);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao carregar histórico de mensagens.");
            }
        }

        [HttpGet("get-chat-by-appointment-id/{appointmentId}")]
        public async Task<ActionResult<Chat>> GetChat(int appointmentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == appointmentId);
                if (appointment == null) return NotFound("Não foi possível encontrar a consulta.");

                var isUserInAppointment = appointment.IdPatient == user.Id || appointment.IdProfesional == user.Id;
                if (!isUserInAppointment) return BadRequest("Não tem permissão para aceder a esta consulta.");

                var chat = await _context.Chat.FirstOrDefaultAsync(c => c.AppointmentId == appointmentId);
                if (chat == null) return NotFound("Não foi possível encontrar a conversa.");

                return Ok(chat);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao carregar conversa.");
            }
        }
    }
}
