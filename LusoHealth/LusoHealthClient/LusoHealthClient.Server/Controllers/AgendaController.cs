using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Agenda;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.DTOs.Services;
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
	[Authorize]
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
        public async Task<ActionResult<List<Appointment>>> GetNextAppointments()
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
                        .Where(p => p.IdPatient == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Scheduled)
                        .ToList();

                    if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

                    return appointments;


                }
                else if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Scheduled)
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
        public async Task<ActionResult<List<Appointment>>> GetPendingAppointments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            try
            {
                if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Pending)
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

        [HttpPost("get-slots")]
        public async Task<ActionResult<List<AvailableSlot>>> GetSlots(AvailabilityDto slot)
        {
            try
            {
                var slots = await _context.AvailableSlots
                                          .Where(s => s.IdService == slot.ServiceId && s.Start.Date == slot.StartDate)
                                          .ToListAsync();

                return slots;
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar os slots. Tente novamente.");
            }
        }

        [HttpPost("add-availability")]
        public async Task<ActionResult> AddAvailability(AvailabilityDto availabilityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            if (availabilityDto.StartDate == null || availabilityDto.EndDate == null || availabilityDto.StartTime == null || 
                availabilityDto.EndTime == null || availabilityDto.ServiceId == null || availabilityDto.SlotDuration == null || availabilityDto.Type == null)
            {
                return BadRequest("Por favor preencha todos os campos.");
            }

            if(availabilityDto.StartDate > availabilityDto.EndDate)
            {
                return BadRequest("A data de início não pode ser superior à data de fim.");
            }

            if (availabilityDto.StartTime > availabilityDto.EndTime)
            {
                return BadRequest("A hora de início não pode ser superior à hora de fim.");
            }

            try
            {
                var slots = await _context.AvailableSlots
                .Where(s => s.IdService == availabilityDto.ServiceId
                && s.Start.Date >= availabilityDto.StartDate
                && s.Start.Date <= availabilityDto.EndDate
                && s.Start.TimeOfDay >= availabilityDto.StartTime.Value.TimeOfDay
                && s.Start.AddMinutes(s.SlotDuration).TimeOfDay <= availabilityDto.EndTime.Value.TimeOfDay) 
                .ToListAsync();

                if (slots != null && slots.Any()) { return BadRequest("Já existem slots para o período selecionado."); }

                var totalDays = (availabilityDto.EndDate - availabilityDto.StartDate).Value.TotalDays + 1;

                var totalDuration = (availabilityDto.EndTime - availabilityDto.StartTime).Value.TotalMinutes;

                var numberOfSlots = (int)(totalDuration / availabilityDto.SlotDuration);

                var newSlots = new List<AvailableSlot>();

                for(int i = 0; i < totalDays; i++)
                {
                    var slotStartTime = availabilityDto.StartDate.Value.AddDays(i).Add(availabilityDto.StartTime.Value.TimeOfDay);

                    for (int j = 0; j < numberOfSlots; j++)
                    {
                        var slot = new AvailableSlot
                        {
                            Start = slotStartTime.AddMinutes(j * availabilityDto.SlotDuration.Value),
                            SlotDuration = availabilityDto.SlotDuration.Value,
                            IdService = availabilityDto.ServiceId.Value,
                            AppointmentType = (AppointmentType)Enum.Parse(typeof(AppointmentType), availabilityDto.Type, true),
                            IsAvailable = true,
                        };

                        newSlots.Add(slot);
                    }
                }

                await _context.AvailableSlots.AddRangeAsync(newSlots);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Slots adicionados com sucesso."});

            }
            catch (Exception)
            {
            return BadRequest("Não foi possível adicionar os slots. Tente novamente.");
            }
        }


        [HttpDelete("delete-availability")]
        public async Task<ActionResult> DeleteSlots([FromBody] AvailabilityDto availabilityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            if (availabilityDto.StartDate == null || availabilityDto.EndDate == null )
            {
                return BadRequest("Por favor deixe-se de brincadeiras.");
            }

            if (availabilityDto.StartDate > availabilityDto.EndDate)
            {
                return BadRequest("A data de início não pode ser superior à data de fim.");
            }

            try
            {
                var slots = await _context.AvailableSlots
                .Where(s => s.IdService == availabilityDto.ServiceId
                && s.Start.Date >= availabilityDto.StartDate
                && s.Start.Date <= availabilityDto.EndDate)
                .ToListAsync();

                if (slots == null || slots.Count == 0) { return BadRequest("Não existem slots para o período selecionado."); }

                //delete slots from db
                _context.AvailableSlots.RemoveRange(slots);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Disponibilidades removidas com sucesso." });

            }
            catch (Exception)
            {
                return BadRequest("Não foi possível remover os slots. Tente novamente.");
            }
        }
    }
}
