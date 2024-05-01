using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Agenda;
using LusoHealthClient.Server.DTOs.Appointments;
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
using System.Linq;
using System.Security.Claims;
using static System.Reflection.Metadata.BlobBuilder;

namespace LusoHealthClient.Server.Controllers
{
    /// <summary>
    /// Controlador para lidar com operações relacionadas à agenda de marcações.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AgendaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        /// <summary>
        /// Construtor para inicializar o controlador AgendaController.
        /// </summary>
        public AgendaController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        /// <summary>
        /// Obtém as marcações anteriores do paciente.
        /// </summary>
        [HttpGet("get-previous-appointments")]
        public async Task<ActionResult<List<AppointmentDto>>> GetPreviousAppointments()
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
                    .OrderByDescending(p => p.Timestamp)
                    .Select(ap => new AppointmentDto
                    {
                        Id = ap.Id,
                        Timestamp = ap.Timestamp,
                        Location = null,
                        Address = null,
                        Type = ap.Type.ToString(),
                        Description = ap.Description,
                        State = ap.State.ToString(),
                        Duration = ap.Duration,
                        IdPatient = ap.IdPatient,
                        IdProfessional = ap.IdProfesional,
                        IdService = ap.IdService,
                        Professional = new ProfessionalDto
                        {
                            ProfessionalInfo = new UserProfileDto
                            {
                                Id = ap.Professional.User.Id,
                                FirstName = ap.Professional.User.FirstName,
                                LastName = ap.Professional.User.LastName,
                                Email = ap.Professional.User.Email,
                            }
                        },
                        Speciality = ap.Service.Specialty.Name
                    })
                    .ToList();

                    if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

                    return appointments;
                }
                else if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment
                    .Where(p => p.IdProfesional == user.Id && p.Timestamp < currentTime)
                    .OrderByDescending(p => p.Timestamp)
                    .Select(ap => new AppointmentDto
                    {
                        Id = ap.Id,
                        Timestamp = ap.Timestamp,
                        Location = null,
                        Address = null,
                        Type = ap.Type.ToString(),
                        Description = ap.Description,
                        State = ap.State.ToString(),
                        Duration = ap.Duration,
                        IdPatient = ap.IdPatient,
                        IdProfessional = ap.IdProfesional,
                        IdService = ap.IdService,
                        Patient = new PatientDto
                        {
                            UserId = ap.Patient.User.Id,
                            User = new UserProfileDto
                            {
                                Id = ap.Patient.User.Id,
                                FirstName = ap.Patient.User.FirstName,
                                LastName = ap.Patient.User.LastName,
                                Email = ap.Patient.User.Email,
                            }
                        },
                        Speciality = ap.Service.Specialty.Name
                    })
                    .ToList();

                    if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

                    return Ok(appointments);
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


        /// <summary>
        /// Obtém as próximas marcações do paciente.
        /// </summary>
        [HttpGet("get-next-appointments")]
        public async Task<ActionResult<List<AppointmentDto>>> GetNextAppointments()
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
                        .Include(c => c.Professional)
                        .ThenInclude(b => b.User)
                        .Include(a => a.Patient)
                        .ThenInclude(b => b.User)
                        .Where(p => p.IdPatient == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Scheduled)
                        .OrderBy(p => p.Timestamp)
                        .Select(ap => new AppointmentDto
                        {
                            Id = ap.Id,
                            Timestamp = ap.Timestamp,
                            Location = null,
                            Address = null,
                            Type = ap.Type.ToString(),
                            Description = ap.Description,
                            State = ap.State.ToString(),
                            Duration = ap.Duration,
                            IdPatient = ap.IdPatient,
                            IdProfessional = ap.IdProfesional,
                            IdService = ap.IdService,
                            Professional = new ProfessionalDto
                            {
                                ProfessionalInfo = new UserProfileDto
                                {
                                    Id = ap.Professional.User.Id,
                                    FirstName = ap.Professional.User.FirstName,
                                    LastName = ap.Professional.User.LastName,
                                    Email = ap.Professional.User.Email,
                                }
                            },
                            Speciality = ap.Service.Specialty.Name
                        })
                        .ToList();

                    if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

                    return appointments;


                }
                else if (User.IsInRole("Professional"))
                {
                    var currentTime = DateTime.UtcNow;
                    var appointments = _context.Appointment.Include(s => s.Service)
                        .ThenInclude(s => s.Specialty)
                        .Include(c => c.Professional)
                        .ThenInclude(b => b.User)
                        .Include(a => a.Patient)
                        .ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Scheduled)
                        .OrderBy(p => p.Timestamp)
                        .Select(ap => new AppointmentDto
                        {
                            Id = ap.Id,
                            Timestamp = ap.Timestamp,
                            Location = null,
                            Address = null,
                            Type = ap.Type.ToString(),
                            Description = ap.Description,
                            State = ap.State.ToString(),
                            Duration = ap.Duration,
                            IdPatient = ap.IdPatient,
                            IdProfessional = ap.IdProfesional,
                            IdService = ap.IdService,
                            Patient = new PatientDto
                            {
                                UserId = ap.Patient.User.Id,
                                User = new UserProfileDto
                                {
                                    Id = ap.Patient.User.Id,
                                    FirstName = ap.Patient.User.FirstName,
                                    LastName = ap.Patient.User.LastName,
                                    Email = ap.Patient.User.Email,
                                }
                            },
                            Speciality = ap.Service.Specialty.Name
                        })
                        .ToList();

                    if (appointments == null || !appointments.Any()) { return NotFound("Não foi possível encontrar as marcações"); }

                    return Ok(appointments);
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


        /// <summary>
        /// Obtém as marcações pendentes do profissional.
        /// </summary>s
        [HttpGet("get-pending-appointments")]
        public async Task<ActionResult<List<AppointmentDto>>> GetPendingAppointments()
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
                    var appointments = _context.Appointment.Include(s => s.Service).ThenInclude(s => s.Specialty).Include(a => a.Patient).ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > currentTime && p.State == AppointmentState.Pending)
                        .OrderBy(p => p.Timestamp)
                        .Select(ap => new AppointmentDto
                        {
                            Id = ap.Id,
                            Timestamp = ap.Timestamp,
                            Location = null,
                            Address = null,
                            Type = ap.Type.ToString(),
                            Description = ap.Description,
                            State = ap.State.ToString(),
                            Duration = ap.Duration,
                            IdPatient = ap.IdPatient,
                            IdProfessional = ap.IdProfesional,
                            IdService = ap.IdService,
                            Patient = new PatientDto
                            {
                                UserId = ap.Patient.User.Id,
                                User = new UserProfileDto
                                {
                                    Id = ap.Patient.User.Id,
                                    FirstName = ap.Patient.User.FirstName,
                                    LastName = ap.Patient.User.LastName,
                                    Email = ap.Patient.User.Email,
                                }
                            },
                            Speciality = ap.Service.Specialty.Name
                        })
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

        /// <summary>
        /// Obtém as especialidades disponíveis.
        /// </summary>
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

        /// <summary>
        /// Obtém os slots disponíveis por data.
        /// </summary>
        [HttpPost("get-slots")]
        public async Task<ActionResult<List<AvailableSlot>>> GetSlotsByDate(AvailabilityDto slot)
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

        /// <summary>
        /// Obtém todos os slots disponíveis.
        /// </summary>
        [HttpGet("get-all-slots")]
        public async Task<ActionResult<List<AvailableSlot>>> GetSlots()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");

            try
            {
                var slots = await _context.AvailableSlots
                .Where(s => s.Service.IdProfessional == user.Id && s.IsAvailable && s.Start >= DateTime.UtcNow)
                .Select(s => new
                {
                    s.Id,
                    s.IdService,
                    s.IsAvailable,
                    s.SlotDuration,
                    Start = TimeZoneInfo.ConvertTimeFromUtc(s.Start, portugueseZone),
                    End = TimeZoneInfo.ConvertTimeFromUtc(s.Start.AddMinutes(s.SlotDuration), portugueseZone),
                    //Title = s.Service.Specialty.Name,
                    //create title that merges the specialty name and the appointment type
                    Title = s.Service.Specialty.Name + " - " + s.AppointmentType.ToString(),
                    IsAppointment = false,
                })
                .ToListAsync();

                return Ok(slots);
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar os slots. Tente novamente.");
            }
        }

        private string GetAppointmentType(AppointmentType type)
        {
            switch (type)
            {
                case AppointmentType.Online:
                    return "Online";
                case AppointmentType.Home:
                    return "Domicílio";
                case AppointmentType.Presential:
                    return "Presencial";
                default:
                    return "Online";
            }
        }

        [HttpGet("get-next-appointments-calendar")]
        public async Task<ActionResult<List<Appointment>>> GetNextAppointmentsCalendar()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            TimeZoneInfo portugueseZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");

            try
            {
                var appointments = _context.Appointment.Include(a => a.Patient).ThenInclude(b => b.User)
                        .Where(p => p.IdProfesional == user.Id && p.Timestamp > DateTime.UtcNow && p.State == AppointmentState.Scheduled)
                        .Select(a => new
                        {
                            a.Id,
                            a.IdService,
                            a.State,
                            a.Timestamp,
                            a.Duration,
                            a.IdProfesional,
                            a.IdPatient,
                            a.AddressId,
                            Start = TimeZoneInfo.ConvertTimeFromUtc(a.Timestamp, portugueseZone),
                            End = TimeZoneInfo.ConvertTimeFromUtc(a.Timestamp.AddMinutes(a.Duration.Value), portugueseZone),
                            Title = "Consulta de " + a.Service.Specialty.Name + " - " + a.Type.ToString(),
                            IsAppointment = true,
                        })
                        .OrderBy(p => p.Timestamp)
                        .ToList();

                return Ok(appointments);
            }
            catch (Exception)
            {
                return BadRequest("Não foi possível encontrar as consultas. Tente novamente.");
            }
        }

        /// <summary>
        /// Adiciona disponibilidade para um profissional.
        /// </summary>
        [HttpPost("add-availability")]
        public async Task<ActionResult> AddAvailability(AvailabilityDto availabilityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            try
            {

                if (availabilityDto.StartDate == null || availabilityDto.EndDate == null || availabilityDto.StartTime == null ||
                availabilityDto.EndTime == null || availabilityDto.ServiceId == null || availabilityDto.SlotDuration == null || availabilityDto.Type == null)
                {
                    return BadRequest("Por favor preencha todos os campos.");
                }

                if (availabilityDto.StartDate > availabilityDto.EndDate)
                {
                    return BadRequest("A data de início não pode ser superior à data de fim.");
                }

                //check if start and end date are not before today
                if (availabilityDto.StartDate < DateTime.UtcNow.Date || availabilityDto.EndDate < DateTime.UtcNow.Date)
                {
                    return BadRequest("A data de início e de fim não podem ser anteriores à data de hoje.");
                }

                if (availabilityDto.StartTime > availabilityDto.EndTime)
                {
                    return BadRequest("A hora de início não pode ser superior à hora de fim.");
                }

                var startDateTime = availabilityDto.StartDate.Value.Add(availabilityDto.StartTime.Value.TimeOfDay);

                if (startDateTime < DateTime.UtcNow.AddHours(1))
                {
                    return BadRequest("Só pode adicionar disponibilidade que comece daqui a 1 hora.");
                }


                //create a variable to store the service data of the service id provided in the dto
                var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == availabilityDto.ServiceId);

                if (service == null || service.Id != availabilityDto.ServiceId)
                {
                    return BadRequest("Algo correu mal");
                }

                if (service.Online == false && availabilityDto.Type == "Online")
                {
                    //return bad request if the service is not available online and tell the profesional to go to their profile page and chnage that possibility
                    return BadRequest("Este serviço não está definido para permitir consultas online.");
                }
                if (service.Home == false && availabilityDto.Type == "Home")
                {
                    return BadRequest("Este serviço não está definido para permitir consultas domicílio.");
                }
                if (service.Presential == false && availabilityDto.Type == "Presential")
                {
                    return BadRequest("Este serviço não está definido para permitir consultas presencialmente.");
                }

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

                for (int i = 0; i < totalDays; i++)
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

                return Ok(new { message = "Slots adicionados com sucesso." });

            }
            catch (Exception)
            {
                return BadRequest("Não foi possível adicionar os slots. Tente novamente.");
            }
        }

        /// <summary>
        /// Remove disponibilidade de um profissional.
        /// </summary>
        [HttpDelete("delete-availability")]
        public async Task<ActionResult> DeleteSlots([FromBody] AvailabilityDto availabilityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) { return BadRequest("Não foi possível encontrar o utilizador"); }

            var user = await _userManager.FindByIdAsync(userIdClaim);
            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            if (availabilityDto.StartDate == null || availabilityDto.EndDate == null)
            {
                return BadRequest("Algo correu mal. Tente novamente.");
            }

            if (availabilityDto.StartDate > availabilityDto.EndDate)
            {
                return BadRequest("A data de início não pode ser superior à data de fim.");
            }

            if (availabilityDto.StartDate < DateTime.UtcNow || availabilityDto.EndDate < DateTime.UtcNow)
            {
                return BadRequest("Não é possível remover disponibilidades passadas.");
            }

            try
            {
                var slots = await _context.AvailableSlots
                .Include(s => s.Service)
                .Where(s => s.Service.IdProfessional == user.Id
                && s.Start >= availabilityDto.StartDate
                && s.Start <= availabilityDto.EndDate.Value.AddSeconds(-1)
                && s.IsAvailable)
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
