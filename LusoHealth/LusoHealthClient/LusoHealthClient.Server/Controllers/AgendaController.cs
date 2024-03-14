using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LusoHealthClient.Server.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AgendaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public AgendaController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("get-previous-appointments")]
        public async Task<ActionResult<List<Appointment>>> GetPreviousAppointments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

			try
			{
				if (User.IsInRole("Patient"))
				{
					var currentTime = DateTime.UtcNow;
					var appointments = _context.Appointment
					.Where(p => p.IdPatient == user.Id && p.Timestamp < currentTime)
					.ToList();

					if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

					return appointments;
				}
				else if (User.IsInRole("Professional"))
				{
					var currentTime = DateTime.UtcNow;
					var appointments = _context.Appointment
					.Where(p => p.IdProfesional == user.Id && p.Timestamp < currentTime)
					.ToList();

					if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

					return appointments;
				}
				else
				{
					return BadRequest("Não foi possível encontrar as marcações. Tente novamente.");
				}
			}
			catch (Exception)
			{
				return BadRequest("Não foi possível encontrar as marcações. Tente novamente.");
			}
        }


		[HttpGet("get-next-appointments")]
		public async Task<ActionResult<List<Appointment>>> getNextAppointments()
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

			var user = await _userManager.FindByIdAsync(userIdClaim);
			if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

			try
			{
				if (User.IsInRole("Patient"))
				{

					var currentTime = DateTime.UtcNow;
					var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
						.Where(p => p.IdPatient == user.Id && p.Timestamp > currentTime)
						.ToList();

					if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

					return appointments;


				}
				else if (User.IsInRole("Professional"))
				{
					var currentTime = DateTime.UtcNow;
					var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
						.Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime)
						.ToList();

					if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

					return appointments;
				}
                else
                {
					return BadRequest("Não foi possível encontrar as marcações. Tente novamente.");
				}

			}

			catch (Exception)
			{
				return BadRequest("Não foi possível encontrar as marcações. Tente novamente.");
			}

		}


		[HttpGet("get-pending-appointments")]
		public async Task<ActionResult<List<Appointment>>> getPendingAppointments()
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

			var user = await _userManager.FindByIdAsync(userIdClaim);
			if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

			try
			{
					var currentTime = DateTime.UtcNow;
					var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
						.Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Pending)
						.ToList();

					if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

					return appointments;
				

			}

			catch (Exception)
			{
				return BadRequest("Não foi possível encontrar as marcações. Tente novamente.");
			}

		}


		[HttpGet("get-specialties")]
        public async Task<ActionResult<List<Specialty>>> GetSpecialties()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            try
            {
                var specialties = _context.Specialties.ToList();
                if (specialties == null) { return NotFound("Não foi possível encontrar as especialidades"); }
                return specialties;
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as especialidades. Tente novamente.");
            }
        }

        [HttpGet("get-slots")]
        public async Task<ActionResult<List<AvailableSlot>>> GetSlots()
        {
            try
            {
                var slots = _context.AvailableSlots.Where(s => s.IdService == 1).ToList();

                if (slots == null) { return NotFound("Não foi possível encontrar os slots"); }
                return slots;
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar os slots. Tente novamente.");
            }
        }




    }
}
