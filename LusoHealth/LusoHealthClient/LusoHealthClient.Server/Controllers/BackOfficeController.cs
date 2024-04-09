using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            public BackOfficeController(ApplicationDbContext context/*, UserManager<User> userManager*/)
            {
                _context = context;
              //  _userManager = userManager;
            }

            [HttpGet("get-valid-users")]
            public async Task<ActionResult<User>> GetValidUsers()
            {
                var users = await _context.Users.ToListAsync();
                if (users == null) return BadRequest("Não foi possível encontrar a informação dos utilizadores.");
                return Ok(users);
            }

            [HttpGet("get-apointments-per-professional")]
            public async Task<ActionResult<List<object>>> GetAppointmentsPerProfessional()
            {
                var professionals = await _context.Professionals.ToListAsync();
                var appointments = await _context.Appointment.ToListAsync();
                var professionalType = await _context.ProfessionalTypes.ToListAsync();
                var users = await _context.Users.ToListAsync();
                var services = await _context.Services.ToListAsync();
                var specialties = await _context.Specialties.ToListAsync();

                List<object> profData = new List<object>();

                if (professionals == null) return BadRequest("Não foi possível encontrar a informação dos profissionais.");
                if (appointments == null) return BadRequest("Não foi possível encontrar a informação dos agendamentos.");
                if (professionalType == null) return BadRequest("Não foi possível encontrar a informação dos tipos de profissionais.");
                if (users == null) return BadRequest("Não foi possível encontrar a informação dos utilizadores.");
                if (services == null) return BadRequest("Não foi possível encontrar a informação dos serviços.");
                if (specialties == null) return BadRequest("Não foi possível encontrar a informação das especialidades.");

                foreach (var professional in professionals)
                {
                    var professionalData = users.FirstOrDefault(u => u.Id == professional.UserID);
                    var professionalTypeData = professionalType.FirstOrDefault(pt => pt.Id == professional.ProfessionalTypeId);
                    var professionalServiceData = services.FirstOrDefault(s => s.IdProfessional == professional.UserID);
                    if (professionalServiceData != null)
                    {
                        var professionalSpecialtyData = specialties.FirstOrDefault(s => s.Id == professionalServiceData.IdSpecialty);


                        object data = new
                        {
                            Name = professionalData.FirstName,
                            Category = professionalTypeData.Name,
                            Especiality = professionalSpecialtyData.Name,
                            NumberOfAppointments = appointments.Count(x => x.IdProfesional == professional.UserID),
                        };

                        profData.Add(data);

                    }
                }


                return Ok(profData);
            }

            /*
            [HttpGet("get-anually-registered")]
            public async Task<ActionResult<List<object>>> GetAnuallyRegistered()
            {

            }
            */


            
            [HttpGet("get-professionals-by-ranking")]
            public async Task<ActionResult<List<object>>> GetProfessionalsByRanking()
            {

            }
            

            //[HttpGet("get-professionals")]

            //[HttpGet("get-professionals/{}")]
        }
    }
}
