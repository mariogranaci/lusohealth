using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Administration;
using LusoHealthClient.Server.DTOs.Profile;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LusoHealthClient.Server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class HomeController : ControllerBase
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<User> _userManager;
		private readonly ILogger<ProfileController> _logger;

		public HomeController(ApplicationDbContext context, UserManager<User> userManager, ILogger<ProfileController> logger)
		{
			_context = context;
			_userManager = userManager;
			_logger = logger;
		}

		[Authorize]
		[HttpGet("get-service-info/{id}")]
		public async Task<ActionResult<MakeAppointmentDto>> GetServiceInfo(int id)
		{
			var info = await _context.Services
				.Include(s => s.Specialty)
				.ThenInclude(o => o.ProfessionalType)
				.Include(p => p.Professional)
				.ThenInclude(u => u.User)
				.FirstOrDefaultAsync(x => x.Id == id);

			if(info == null)
			{
				return BadRequest("Não foi possível encontrar a informação do serviço.");
			}

			MakeAppointmentDto makeAppointmentDto = new MakeAppointmentDto
			{
				ServiceId = info.Id,
				SpecialtyId = info.IdSpecialty,
				Specialty = info.Specialty.Name,
				ProfessionalName = info.Professional.User.FirstName + " " + info.Professional.User.LastName,
				Category = info.Specialty.ProfessionalType.Name,
				Online = info.Online,
				Presential = info.Presential,
				Home = info.Home,
			};

			return makeAppointmentDto;
		}



		[HttpPost("add-appointment")]
		public async Task<ActionResult> AddReport(MakeAppointmentDto makeAppointmentDto)
		{
			try
			{
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

				var user = await _userManager.FindByIdAsync(userId);
				if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

				var MakeAppointmentDto = new makeAppointmentDto
				{
					Timestamp = DateTime.Now,
					IdPatient = user.Id,
					IdProfesional = reportDto.IdProfesional,
					Description = reportDto.De

				};

				_context.Appointment.Add(makeAppointmentDto);
				await _context.SaveChangesAsync();

				return Ok(new { message = "O report foi enviado com sucesso." });
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao enviar o report: {ex.Message}");
			}
		}
	}
}
