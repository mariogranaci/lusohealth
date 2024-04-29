using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Appointments;
using LusoHealthClient.Server.DTOs.Authentication;
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
using System.Text;

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
         

        public AppointmentController(ApplicationDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

		/// <summary>
		/// Obtém as informações de uma consulta pelo ID.
		/// </summary>
		/// <param name="id">ID da consulta.</param>
		/// <returns>As informações da consulta.</returns>
		[HttpGet("get-appointment-info/{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            var info = await _context.Appointment.Include(a => a.Address).FirstOrDefaultAsync(x => x.Id == id);

            if (info == null) return BadRequest("Não foi possível encontrar a informação da consulta.");

            AppointmentDto appointmentDto = new AppointmentDto
            {
                Timestamp = info.Timestamp,
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
            if (model == null) return BadRequest("Não foi possível acabar a consulta.");
            var appointment = await _context.Appointment.FindAsync(model.Id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.Done;
                model.State = "Done";

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
		/// Começa uma consulta.
		/// </summary>
		/// <param name="model">As informações da consulta a ser iniciada.</param>
		/// <returns>A consulta iniciada.</returns>
		[HttpPatch("begin-appointment")]
        public async Task<ActionResult<AppointmentDto>> BeginAppointment(AppointmentDto model)
        {
            if (model == null) return BadRequest("Não foi possível começar a consulta.");
            var appointment = await _context.Appointment.FindAsync(model.Id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.InProgress;
                model.State = "InProgress";

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
            var slots = await _context.AvailableSlots.Where(x => x.IdService == serviceId && x.IsAvailable && x.Start > DateTime.UtcNow).ToListAsync();

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
