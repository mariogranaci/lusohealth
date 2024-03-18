﻿using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Services;
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
        public async Task<ActionResult<AppointmentDto>> GetAppointmentInfo(int id)
        {
            var info = await _context.Appointment.FirstOrDefaultAsync(x => x.Id == id);

            if (info == null)
            {
                return BadRequest("Não foi possível encontrar a informação da consulta.");
            }

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


        [HttpPatch("cancel-appointment/{id}")]
        public async Task<ActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointment.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.Canceled;

                _context.Appointment.Update(appointment);
                await _context.SaveChangesAsync();

                return Ok("Consulta cancelada.");
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar o estado da consulta.");
            }
        }

        [HttpPatch("schedule-appointment/{id}")]
        public async Task<ActionResult> UpdateAppointmentState(int id)
        {
            var appointment = await _context.Appointment.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Consulta não encontrada.");
            }

            try
            {
                appointment.State = AppointmentState.Scheduled;

                _context.Appointment.Update(appointment);
                await _context.SaveChangesAsync();

                return Ok("Estado da consulta atualizado para 'Agendada'.");
            }
            catch (Exception)
            {
                return BadRequest("Ocorreu um erro ao atualizar o estado da consulta.");
            }
        }
    }
}
