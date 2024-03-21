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

                    if (appointments == null) { return NotFound("Não foi possível encontrar as marcações"); }

                    return appointments;
                }
                else if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment
                    .Where(p => p.IdProfesional == user.Id && p.Timestamp < currentTime)
                    .ToList();

                    if (appointments == null) { return NotFound("Não foi possível encontrar as marcações"); }

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

                    if (appointments == null ) { return NotFound("Não foi possível encontrar as marcações"); }

                    return appointments;


                }
                else if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Scheduled)
                        .ToList();

                    if (appointments == null) { return NotFound("Não foi possível encontrar as marcações"); }

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

                    if (appointments == null) { return NotFound("Não foi possível encontrar as marcações"); }

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

    //    [HttpPost("add-slots")]
    //    public async Task<ActionResult> AddSlots(AvailabilityDto availabilityDto)
    //    {
    //        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    //        if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

    //        var user = await _userManager.FindByIdAsync(userIdClaim);
    //        if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

    //        try
    //        {
    //            /*var slots = await _context.AvailableSlots
    //.Where(s => s.IdService == availabilityDto.ServiceId
    //            && s.Start >= intervalStart // Slot starts after or at the interval start time
    //            && s.Start < intervalEnd // Slot starts before the interval end time
    //            && s.IsAvailable) // Assuming you're also interested in filtering by availability
    //.ToListAsync();*/

    //            var totalDuration = (availabilityDto.EndDate - availabilityDto.StartDate).TotalMinutes;

    //            var numberOfSlots = (int)(totalDuration / availabilityDto.SlotDuration);

    //            var newSlots = new List<AvailableSlot>();

    //            for (int i = 0; i < numberOfSlots; i++)
    //            {
    //                var slotStartTime = availabilityDto.StartDate.AddMinutes(i * availabilityDto.SlotDuration);

    //                var slot = new AvailableSlot
    //                {
    //                    Start = slotStartTime,
    //                    SlotDuation = availabilityDto.SlotDuration,
    //                    IdService = availabilityDto.ServiceId,
    //                    AppointmentType = (AppointmentType)Enum.Parse(typeof(AppointmentType), availabilityDto.Type, true),
    //                    IsAvailable = true,
    //                };

    //                newSlots.Add(slot);
    //            }

    //            await _context.AvailableSlots.AddRangeAsync(slots);
    //            await _context.SaveChangesAsync();

    //            return Ok("Slots adicionados com sucesso.");

    //        }
    //        catch (Exception)
    //        {
    //            return BadRequest("Não foi possível adicionar os slots. Tente novamente.");
    //        }
    //    }


        [HttpDelete("delete-slots")]
        public async Task<ActionResult> DeleteSlots([FromBody] AvailabilityDto availabilityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            try
            {
                var slots = await _context.AvailableSlots.Where(s => s.IdService == availabilityDto.ServiceId).ToListAsync();

                if (slots == null) { return NotFound("Não foi possível encontrar os slots"); }

                _context.AvailableSlots.RemoveRange(slots);
                await _context.SaveChangesAsync();

                return Ok("Slots removidos com sucesso.");

            }
            catch (Exception)
            {
                return BadRequest("Não foi possível remover os slots. Tente novamente.");
            }
        }

    }
}
