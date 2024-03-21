using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Appointments;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public AppointmentController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        [HttpGet("get-appointment-info/{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            var info = await _context.Appointment.FirstOrDefaultAsync(x => x.Id == id);

            if (info == null) return BadRequest("Não foi possível encontrar a informação da consulta.");

            AppointmentDto appointmentDto = new AppointmentDto
            {
                Timestamp = info.Timestamp,
                Location = info.Location,
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
                await _context.SaveChangesAsync();

                return model;
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar o estado da consulta.");
            }
        }

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

        [HttpPatch("change-appointment")]
        public async Task<ActionResult<AvailableSlot>> ChangeAppointment(AvailableSlotDto model)
        {
            if (model == null) return BadRequest("Consulta não encontrada.");
            
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

            List<AvailableSlot> slots = new List<AvailableSlot> { oldSlot, newSlot };

            try
            {

                _context.AvailableSlots.UpdateRange(slots);
                await _context.SaveChangesAsync();
                return newSlot;
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar a consulta.");
            }
        }
    }
}
