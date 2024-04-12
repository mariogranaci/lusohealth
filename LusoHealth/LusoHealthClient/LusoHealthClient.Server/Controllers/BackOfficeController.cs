using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LusoHealthClient.Server.Controllers
{
    namespace LusoHealthClient.Server.Controllers
    {
        //[Authorize]
        [Route("api/[controller]")]
        [ApiController]
        public class BackOfficeController : ControllerBase
        {
            private readonly ApplicationDbContext _context;

            public BackOfficeController(ApplicationDbContext context)
            {
                _context = context;
            }

            [HttpGet("get-valid-users")]
            public async Task<ActionResult<User>> GetValidUsers()
            {
                var users = await _context.Users.ToListAsync();
                if (users == null) return BadRequest("Não foi possível encontrar a informação dos utilizadores.");
                return Ok(users);
            }

            [HttpGet("get-apointments-per-professional/{selectedFilter}")]
            public async Task<ActionResult<List<object>>> GetAppointmentsPerProfessional(int selectedFilter)
            {
                var specialties = await _context.Specialties.ToListAsync();
                var services = await _context.Services.ToListAsync();
                var appointments = await _context.Appointment.ToListAsync();
                var professionalTypes = await _context.ProfessionalTypes.ToListAsync();

                List<object> specialtyData = new List<object>();

                if (specialties == null) return BadRequest("Não foi possível encontrar a informação das especialidades.");
                if (appointments == null) return BadRequest("Não foi possível encontrar a informação dos agendamentos.");
                if (services == null) return BadRequest("Não foi possível encontrar a informação dos serviços.");
                if (professionalTypes == null) return BadRequest("Não foi possível encontrar a informação dos tipos de profissionais.");

                foreach (var specialty in specialties)
                {
                    if (specialty.ProfessionalTypeId == selectedFilter || selectedFilter == 0) { 
                        var service = services.FirstOrDefault(s => s.IdSpecialty == specialty.Id);
                    
                        if (service != null)
                        {
                        
                            int numberOfAppointments = appointments.Count(a => a.IdService == service.Id);

                            object data = new
                            {
                                SpecialtyName = specialty.Name,
                                NumberOfAppointments = numberOfAppointments
                            };

                            specialtyData.Add(data);
                        }
                    }
                }

                return Ok(specialtyData);
            }
            
            [HttpGet("get-anually-registered-users")]
            public async Task<ActionResult<List<object>>> GetAnuallyRegistered()
            {
                //Professionals
                var professionalsRegistered = await _context.Professionals
                    .Include(u => u.User)
                    .ToListAsync();

                var professionalRegistrationsByYear = professionalsRegistered
                    .Where(p => p.User.DateCreated != null && p.User.UserType == 'P')
                    .GroupBy(p => p.User.DateCreated.Year)
                    .OrderBy(group => group.Key)
                    .Select(group => new
                    {
                        Year = group.Key,
                        Count = group.Count()
                    })
                    .ToList();

                //Patients
                var patientsRegistered = await _context.Users
                    .Where(u => u.UserType != 'U') 
                    .ToListAsync();

                var patientRegistrationsByYear = patientsRegistered
                    .Where(u => u.DateCreated != null) 
                    .GroupBy(u => u.DateCreated.Year)
                    .OrderBy(group => group.Key)
                    .Select(group => new
                    {
                        Year = group.Key,
                        Count = group.Count()
                    })
                    .ToList();

                var registrationSummary = new
                {
                    Patients = patientRegistrationsByYear,
                    Professionals = professionalRegistrationsByYear
                };

                return Ok(registrationSummary);
            }



            [HttpGet("get-professionals-by-ranking")]
            public async Task<ActionResult<List<object>>> GetProfessionalsByRanking()
            {
                var query = _context.Professionals
                            .SelectMany(p => p.Services)
                            .GroupBy(s => new { s.Professional.UserID, s.Specialty.Name })
                            .Select(g => new
                                                {
                                                    Nome = g.Key.UserID, // Você precisará substituir isso pelo nome do profissional se ele estiver em uma propriedade diferente
                                                    Categoria = g.FirstOrDefault().Professional.ProfessionalType.Name,
                                                    Especialidade = g.Key.Name,
                                                    Classificacao = g.SelectMany(s => s.Reviews).Average(r => r.Stars)
                                                })
                            .OrderByDescending(x => x.Classificacao)
                            .ToList();

                return Ok(query);
            }

            [HttpGet("get-professional-types")]
            public async Task<ActionResult<List<ProfessionalType>>> GetProfessionalTypes()
            {
                var professionalTypes = await _context.ProfessionalTypes.ToListAsync();
                if (professionalTypes == null) return BadRequest("Não foi possível encontrar a informação dos tipos de profissionais.");
                return Ok(professionalTypes);
            }

            [HttpGet("get-professionals")]
            public async Task<ActionResult<List<Professional>>> GetProfessionals()
            {
                var professionals = await _context.Professionals.ToListAsync();
                return Ok(professionals);
            }


            [HttpGet("compare-registration")]
            public async Task<ActionResult<string>> CompareRegistration()
            {
                try
                {
                    var thisWeekProfessionalsCount = await _context.Professionals.Include(p => p.User).CountAsync(u => u.User.DateCreated >= DateTime.UtcNow.AddDays(-7));
                    var lastWeekProfessionalsCount = await _context.Professionals.Include(p => p.User).CountAsync(u => u.User.DateCreated >= DateTime.UtcNow.AddDays(-14) && u.User.DateCreated < DateTime.UtcNow.AddDays(-7));

                    var professionalComparison = GetRegistrationChangeMessage(thisWeekProfessionalsCount, lastWeekProfessionalsCount);

                    var thisWeekPatientsCount = await _context.Patients.Include(p => p.User).CountAsync(u => u.User.DateCreated >= DateTime.UtcNow.AddDays(-7));
                    var lastWeekPatientsCount = await _context.Patients.Include(p => p.User).CountAsync(u => u.User.DateCreated >= DateTime.UtcNow.AddDays(-14) && u.User.DateCreated < DateTime.UtcNow.AddDays(-7));

                    var patientComparison = GetRegistrationChangeMessage(thisWeekPatientsCount, lastWeekPatientsCount);

                    return Ok(new { professional = professionalComparison, patient = patientComparison });
                } catch (Exception)
                {
                    return BadRequest("Não foi possível comparar os registos.");
                }
            }

            /// <summary>
            /// Retorna uma mensagem baseada na comparação do número de registros desta semana com a semana passada.
            /// </summary>
            /// <param name="thisWeek">Número de registros desta semana.</param>
            /// <param name="lastWeek">Número de registros da semana passada.</param>
            /// <returns>Uma string indicando se o número aumentou, diminuiu ou permaneceu igual.</returns>
            private string GetRegistrationChangeMessage(int thisWeek, int lastWeek)
            {
                if (thisWeek > lastWeek)
                {
                    return "up";
                }
                else if (thisWeek < lastWeek)
                {
                    return "down";
                }
                else
                {
                    return "same";
                }
            }
        }
    }
}

