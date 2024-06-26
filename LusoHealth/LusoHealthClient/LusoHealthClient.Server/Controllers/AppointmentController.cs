﻿using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Appointments;
using LusoHealthClient.Server.DTOs.Authentication;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using LusoHealthClient.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using static System.Reflection.Metadata.BlobBuilder;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]

    /// <summary>
    /// Controller responsável pela gestão de consultas (appointments).
    /// </summary>
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private EmailService _emailService;
        private readonly UserManager<User> _userManager;

        public AppointmentController(ApplicationDbContext context, EmailService emailService, UserManager<User> userManager)
        {
            _context = context;
            _emailService = emailService;
            _userManager = userManager;
        }

        /// <summary>
        /// Obtém as informações de uma consulta pelo ID.
        /// </summary>
        /// <param name="id">ID da consulta.</param>
        /// <returns>As informações da consulta.</returns>
        [HttpGet("get-appointment-info/{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            var info = await _context.Appointment.Include(a => a.Address)
                .Include(p => p.Professional)
                .ThenInclude(u => u.User)
                .Include(p => p.Patient)
                .ThenInclude(u => u.User)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (info == null) return BadRequest("Não foi possível encontrar a informação da consulta.");

            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");

            AppointmentDto appointmentDto = new AppointmentDto
            {
                Timestamp = TimeZoneInfo.ConvertTimeFromUtc(info.Timestamp, portugueseZone),
                Location = info.Address != null ? info.Address.Location : null,
                Address = info.Address != null ? info.Address.AddressName : null,
                Type = info.Type.ToString(),
                Description = info.Description,
                State = info.State.ToString(),
                Duration = info.Duration,
                IdPatient = info.IdPatient,
                IdProfessional = info.IdProfesional,
                IdService = info.IdService,
                Id = info.Id,
                Professional = new ProfessionalDto
                {    
                    ProfessionalInfo = new UserProfileDto
                    {
                        FirstName = info.Professional.User.FirstName,
                        LastName = info.Professional.User.LastName,
                    }
                },
                Patient = new PatientDto
                {
                    User = new UserProfileDto
                    {
                        FirstName = info.Patient.User.FirstName,
                        LastName = info.Patient.User.LastName,
                        Email = info.Patient.User.Email,
                        Telemovel = info.Patient.User.PhoneNumber,
                        DataNascimento = info.Patient.User.BirthDate,
                    }
                },
            };

            return appointmentDto;
        }

        /// <summary>
        /// Cancela uma consulta.
        /// </summary>
        /// <param name="model">As informações da consulta a ser cancelada.</param>
        /// <returns>A consulta cancelada.</returns>
        [HttpPatch("cancel-appointment")]
        public async Task<ActionResult<AppointmentDto>> CancelAppointment(AppointmentDto model)
        {
            if (model == null) return BadRequest("Não foi possível cancelar a consulta.");
            var appointment = await _context.Appointment.FindAsync(model.Id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.Canceled;
                model.State = "Canceled";

                _context.Appointment.Update(appointment);

                var slot = await _context.AvailableSlots.FirstOrDefaultAsync(s => s.AppointmentId == appointment.Id);

                if (slot != null && slot.AppointmentId == appointment.Id)
                {
                    slot.IsAvailable = true;
                    slot.AppointmentId = null;
                    _context.AvailableSlots.Update(slot);
                }
                else
                {
                    return BadRequest("Erro ao cancelar consulta: não foi possível encontrar o slot da consulta.");
                }

                await _context.SaveChangesAsync();

                return model;
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar o estado da consulta.");
            }
        }

        /// <summary>
        /// Termina uma consulta.
        /// </summary>
        /// <param name="model">As informações da consulta a ser terminada.</param>
        /// <returns>A consulta terminada.</returns>
        [HttpPatch("finish-appointment")]
        public async Task<ActionResult<AppointmentDto>> FinishAppointment(AppointmentDto model)
        {
            if (model == null) return BadRequest("Não foi possível começar a consulta.");

            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == model.Id);
                if (appointment == null) return NotFound("Não foi possível encontrar a consulta.");

                var isUserInAppointment = appointment.IdPatient == user.Id || appointment.IdProfesional == user.Id;
                if (!isUserInAppointment) return BadRequest("Não tem permissão para aceder a esta consulta.");

                var chat = await _context.Chat.FirstOrDefaultAsync(c => c.AppointmentId == model.Id);
                if (chat == null) return NotFound("Não foi possível encontrar a conversa.");

                appointment.State = AppointmentState.Done;
                chat.IsActive = false;

                _context.Appointment.Update(appointment);
                _context.Chat.Update(chat);
                await _context.SaveChangesAsync();

                var appointmentDto = new AppointmentDto
                {
                    Id = appointment.Id,
                    Timestamp = TimeZoneInfo.ConvertTimeFromUtc(appointment.Timestamp, portugueseZone),
                    Location = appointment.Address != null ? appointment.Address.Location : null,
                    Address = appointment.Address != null ? appointment.Address.AddressName : null,
                    Type = appointment.Type.ToString(),
                    Description = appointment.Description,
                    State = appointment.State.ToString(),
                    Duration = appointment.Duration,
                    IdPatient = appointment.IdPatient,
                    IdProfessional = appointment.IdProfesional,
                    IdService = appointment.IdService,
                };

                return Ok(appointmentDto);
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao concluir a consulta.");
            }
        }

        /// <summary>
        /// Começa uma consulta.
        /// </summary>
        /// <param name="model">As informações da consulta a ser iniciada.</param>
        /// <returns>A consulta iniciada.</returns>
        [HttpPatch("begin-appointment")]
        public async Task<ActionResult<AppointmentDto>> BeginAppointment(AppointmentDto model)
        {
            if (model == null) return BadRequest("Não foi possível começar a consulta.");

            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == model.Id);
                if (appointment == null) return NotFound("Não foi possível encontrar a consulta.");

                var isUserInAppointment = appointment.IdPatient == user.Id || appointment.IdProfesional == user.Id;
                if (!isUserInAppointment) return BadRequest("Não tem permissão para aceder a esta consulta.");

                var chat = await _context.Chat.FirstOrDefaultAsync(c => c.AppointmentId == model.Id);
                if (chat == null) return NotFound("Não foi possível encontrar a conversa.");

                appointment.State = AppointmentState.InProgress;
                chat.IsActive = true;

                _context.Appointment.Update(appointment);
                _context.Chat.Update(chat);
                await _context.SaveChangesAsync();

                var appointmentDto = new AppointmentDto
                {
                    Id = appointment.Id,
                    Timestamp = TimeZoneInfo.ConvertTimeFromUtc(appointment.Timestamp, portugueseZone),
                    Location = appointment.Address != null ? appointment.Address.Location : null,
                    Address = appointment.Address != null ? appointment.Address.AddressName : null,
                    Type = appointment.Type.ToString(),
                    Description = appointment.Description,
                    State = appointment.State.ToString(),
                    Duration = appointment.Duration,
                    IdPatient = appointment.IdPatient,
                    IdProfessional = appointment.IdProfesional,
                    IdService = appointment.IdService,
                };

                return Ok(appointmentDto);
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao começar a consulta.");
            }
        }

        /// <summary>
        /// Atualiza o estado de uma consulta para agendada.
        /// </summary>
        /// <param name="model">As informações da consulta a ser agendada.</param>
        /// <returns>A consulta agendada.</returns>
        [HttpPatch("schedule-appointment")]
        public async Task<ActionResult<AppointmentDto>> AcceptAppointment(AppointmentDto model)
        {
            if (model == null) return BadRequest("Não foi possível atualizar o estado da consulta.");
            var appointment = await _context.Appointment.FindAsync(model.Id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.Scheduled;
                model.State = "Scheduled";

                _context.Appointment.Update(appointment);
                await _context.SaveChangesAsync();

                return model;
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar o estado da consulta.");
            }
        }

        /// <summary>
        /// Altera a consulta para um novo slot de horário.
        /// </summary>
        /// <param name="model">As informações da consulta e do novo slot de horário.</param>
        /// <returns>O novo slot de horário.</returns>
        [HttpPatch("change-appointment")]
        public async Task<ActionResult<AvailableSlot>> ChangeAppointment(AvailableSlotDto model)
        {
            if (model == null) return BadRequest("Consulta não encontrada.");

            try
            {
                var appointment = await _context.Appointment.FindAsync(model.AppointmentId);
                if (appointment == null) return NotFound("Consulta não encontrada.");

                var oldSlot = await _context.AvailableSlots.Where(a => a.AppointmentId == model.AppointmentId).FirstOrDefaultAsync();
                if (oldSlot == null) return NotFound("Slot não encontrado.");
                oldSlot.IsAvailable = true;
                oldSlot.AppointmentId = null;

                var newSlot = await _context.AvailableSlots.FindAsync(model.Id);
                if (newSlot == null) return NotFound("Slot não encontrado.");
                newSlot.IsAvailable = false;
                newSlot.AppointmentId = model.AppointmentId;

                appointment.Timestamp = newSlot.Start;

                List<AvailableSlot> slots = new List<AvailableSlot> { oldSlot, newSlot };

                _context.AvailableSlots.UpdateRange(slots);
                _context.Appointment.Update(appointment);

                var patient = await _context.Users.FindAsync(appointment.IdPatient);
                var professional = await _context.Users.FindAsync(appointment.IdProfesional);

                await SendAppointmentChangedEmail(patient, professional, newSlot);
                await _context.SaveChangesAsync();

                return newSlot;
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar a consulta.");
            }
        }

        /// <summary>
        /// Obtém os slots de horário disponíveis para um determinado serviço.
        /// </summary>
        /// <param name="serviceId">ID do serviço.</param>
        /// <returns>Os slots de horário disponíveis.</returns>
        [HttpGet("get-available-slots/{serviceId}")]
        public async Task<ActionResult<List<AvailableSlotDto>>> GetAvailableSlots(int serviceId)
        {
            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");

            var slots = await _context.AvailableSlots
                .Where(x => x.IdService == serviceId && x.IsAvailable && x.Start > DateTime.UtcNow)
                .Select(s => new
                {
                    s.Id,
                    s.IdService,
                    s.IsAvailable,
                    s.SlotDuration,
                    s.AppointmentType,
                    s.AppointmentId,
                    Start = TimeZoneInfo.ConvertTimeFromUtc(s.Start, portugueseZone),
                })
                .ToListAsync();

            if (slots == null) return BadRequest("Não foi possível encontrar os slots disponíveis.");

            List<AvailableSlotDto> availableSlots = new List<AvailableSlotDto>();

            foreach (var slot in slots)
            {
                AvailableSlotDto availableSlot = new AvailableSlotDto
                {
                    Id = slot.Id,
                    Start = slot.Start,
                    SlotDuration = slot.SlotDuration,
                    IdService = slot.IdService,
                    AppointmentType = slot.AppointmentType.ToString(),
                    IsAvailable = slot.IsAvailable,
                    AppointmentId = slot.AppointmentId
                };

                availableSlots.Add(availableSlot);
            }

            return availableSlots;
        }

        /// <summary>
		/// Obtém uma sugestão de consulta com base na disponibilidade do profissional.
		/// </summary>
		/// <param name="professionalId">ID do profissional.</param>
		/// <returns>Os slots de horário disponíveis.</returns>
		[HttpGet("get-appointment-sugestion/{serviceId}")]
        public async Task<ActionResult<AvailableSlotDto>> GetAppointmentSugestion(int serviceId)
        {
            DateTime currentDate = DateTime.Now.Date;
            DateTime endDate = currentDate.AddDays(30).Date; // End date is one week from today

            var appointmentCounts = await _context.AvailableSlots
                .Where(x => x.IdService == serviceId && x.Start > currentDate && x.Start < endDate && !x.IsAvailable) // Filter appointments for the next week
                .GroupBy(x => x.Start)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            if (appointmentCounts == null) return BadRequest("Não foi possível encontrar os slots disponíveis.");

            DateTime suggestedDate = appointmentCounts.FirstOrDefault()?.Date ?? currentDate.Date;

            var suggestedAppointment = await _context.AvailableSlots
                .Where(x => x.IdService == serviceId &&
                            x.Start > suggestedDate &&
                            x.IsAvailable)
                .OrderBy(x => x.Start).ToListAsync();

            var suggested = suggestedAppointment.FirstOrDefault();

            if(suggested == null)
            {
                return BadRequest("Não foi possível encontrar um slot disponível.");
            } else
            {
                TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");
                AvailableSlotDto suggestedSlot = new AvailableSlotDto
                {
                    Id = suggested.Id,
                    Start = TimeZoneInfo.ConvertTimeFromUtc(suggested.Start, portugueseZone),
                    SlotDuration = suggested.SlotDuration,
                    IdService = suggested.IdService,
                    AppointmentType = suggested.AppointmentType.ToString(),
                    IsAvailable = suggested.IsAvailable,
                    AppointmentId = suggested.AppointmentId
                };
                return suggestedSlot;
            }

        }
        
        private async Task<bool> SendAppointmentChangedEmail(User patient, User professional, AvailableSlot availableSlot)
        {
            var body = $"Olá {patient.FirstName + " " + patient.LastName}, <br/>" +
                $"A data da sua consulta com {professional.FirstName} {professional.LastName} foi alterada.<br/>" +
                $"A data foi alterada para o dia {availableSlot.Start.ToString("dd-MM-yyyy")} às {availableSlot.Start.ToString("HH:mm")} horas<br/>" +
                "<p>Pedimos desculpa pelo incómodo,</p> <br/>" +
            $"LusoHealth";

            var emailSend = new EmailSendDto(patient.Email, "Recuperar Conta", body);

            return await _emailService.SendEmailAsync(emailSend);
        }
    }
}
