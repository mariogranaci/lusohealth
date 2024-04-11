using LusoHealthClient.Server.Data;
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
			//private readonly UserManager<User> _userManager;

			/// <summary>
			/// Construtor da classe BackOfficeController.
			/// </summary>
			/// <param name="context">Contexto do banco de dados.</param>
			public BackOfficeController(ApplicationDbContext context/*, UserManager<User> userManager*/)
            {
                _context = context;
              //  _userManager = userManager;
            }

			/// <summary>
			/// Obtém todos os utilizadores válidos do sistema.
			/// </summary>
			/// <returns>Uma lista de usuários válidos.</returns>
			[HttpGet("get-valid-users")]
            public async Task<ActionResult<User>> GetValidUsers()
            {
                var users = await _context.Users.ToListAsync();
                if (users == null) return BadRequest("Não foi possível encontrar a informação dos utilizadores.");
                return Ok(users);
            }

			/// <summary>
			/// Obtém o número de consultas por especialidade, filtrado pelo tipo de profissional selecionado.
			/// </summary>
			/// <param name="selectedFilter">Filtro para o tipo de profissional.</param>
			/// <returns>Uma lista de objetos representando as especialidades e o número de consultas associadas.</returns>
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


			/// <summary>
			/// Obtém o número de usuários registrados anualmente, separados por pacientes e profissionais.
			/// </summary>
			/// <returns>Um objeto contendo o número de registos de pacientes e profissionais por ano.</returns>
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


			/// <summary>
			/// Obtém os profissionais classificados por sua média de classificação.
			/// </summary>
			/// <returns>Uma lista de profissionais ordenados por sua média de classificação.</returns>
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

			/// <summary>
			/// Obtém os tipos de profissionais disponíveis no sistema.
			/// </summary>
			/// <returns>Uma lista de tipos de profissionais.</returns>
			[HttpGet("get-professional-types")]
            public async Task<ActionResult<List<object>>> GetProfessionalTypes()
            {
                var professionalTypes = await _context.ProfessionalTypes.ToListAsync();
                if (professionalTypes == null) return BadRequest("Não foi possível encontrar a informação dos tipos de profissionais.");
                return Ok(professionalTypes);
            }

			/// <summary>
			/// Obtém todos os profissionais registrados no sistema.
			/// </summary>
			/// <returns>Uma lista de todos os profissionais registados.</returns>
			[HttpGet("get-professionals")]
            public async Task<ActionResult<List<object>>> GetProfessionals()
            {
                var professionals = await _context.Professionals.ToListAsync();
                return Ok(professionals);
            }   
            
        }
    }
}

