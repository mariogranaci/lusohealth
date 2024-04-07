using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Administration;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize(Roles = SD.AdminRole + "," + SD.ManagerRole)]
    [Route("api/[controller]")]
    [ApiController]
    public class ManageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public ManageController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet("get-reports/{offset}/{limit}")]
        public async Task<ActionResult<List<ReportDto>>> GetMoreReports(int offset, int limit)
        {
            try
            {
                var reports = await _context.Report
                   .Select(r => new ReportDto
                   {
                       Id = r.Id,
                       Timestamp = r.Timestamp,
                       IdPatient = r.IdPatient,
                       IdProfesional = r.IdProfesional,
                       Description = r.Description,
                       State = r.State
                   })
                   .Skip(offset) 
                   .Take(limit) 
                   .ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return NotFound("No more reports available.");
                }

                return reports;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving reports.");
            }
        }

        [Authorize]
        [HttpGet("get-reports-canceled/{offset}/{limit}")]
        public async Task<ActionResult<List<ReportDto>>> GetAllReportsCanceled(int offset, int limit)
        {
            try
            {
                var reports = await _context.Report
                   .Where(r => r.State == ReportState.Canceled)
                   .Select(r => new ReportDto
                   {
                       Id = r.Id,
                       Timestamp = r.Timestamp,
                       IdPatient = r.IdPatient,
                       IdProfesional = r.IdProfesional,
                       Description = r.Description,
                       State = r.State
                   })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return BadRequest("Não foi possível encontrar nenhum relatório cancelado.");
                }

                return reports;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter relatórios cancelados.");
            }
        }

        [Authorize]
        [HttpGet("get-reports-concluded/{offset}/{limit}")]
        public async Task<ActionResult<List<ReportDto>>> GetAllReportsConcluded(int offset, int limit)
        {
            try
            {
                var reports = await _context.Report
                   .Where(r => r.State == ReportState.Concluded)
                   .Select(r => new ReportDto
                   {
                       Id = r.Id,
                       Timestamp = r.Timestamp,
                       IdPatient = r.IdPatient,
                       IdProfesional = r.IdProfesional,
                       Description = r.Description,
                       State = r.State
                   })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return BadRequest("Não foi possível encontrar nenhum relatório cancelado.");
                }

                return reports;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter relatórios cancelados.");
            }
        }

        [Authorize]
        [HttpGet("get-reports-pending/{offset}/{limit}")]
        public async Task<ActionResult<List<ReportDto>>> GetAllReportsPending(int offset, int limit)
        {
            try
            {
                var reports = await _context.Report
                   .Where(r => r.State == ReportState.Pending)
                   .Select(r => new ReportDto
                   {
                       Id = r.Id,
                       Timestamp = r.Timestamp,
                       IdPatient = r.IdPatient,
                       IdProfesional = r.IdProfesional,
                       Description = r.Description,
                       State = r.State
                   })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return BadRequest("Não foi possível encontrar nenhum relatório cancelado.");
                }

                return reports;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter relatórios cancelados.");
            }
        }


        [HttpPatch("cancel-report")]
        public async Task<ActionResult> ConcludeReport(ReportDto model)
        {
            var report = await _context.Report.FirstOrDefaultAsync(r => r.Id == model.Id);

            if (report == null)
            {
                return NotFound();
            }

            try 
            {
                report.State = ReportState.Canceled;
                _context.Report.Update(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Report concluido." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao cancelar report 🧀.");
            }

        }

        [HttpPatch("suspend-account-professional")]
        public async Task<ActionResult> SuspendAccountProfessional(ReportDto model)
        {
            var user = await _userManager.FindByIdAsync(model.IdProfesional);

            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            if (user.IsSuspended) 
            { 
                return BadRequest("Utilizador já se encontra com a conta suspensa"); 
            }

            try 
            {
                user.IsSuspended = true;
                _context.Users.Update(user);
                await _userManager.SetLockoutEndDateAsync(user, model.BanTime.Date);

                var report = await _context.Report.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (report == null)
                {
                    return NotFound();
                }

                report.State = ReportState.Concluded;
                _context.Report.Update(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta suspensa com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao suspender conta.");
            }
        }

        [HttpPatch("block-account-professional")]
        public async Task<ActionResult> BlockAccountProfessional(ReportDto model)
        {
            var user = await _userManager.FindByIdAsync(model.IdProfesional);

            if (user == null) { return NotFound("Não foi possível encontrar o utilizador."); }

            if (user.IsBlocked)
            {
                return BadRequest("Utilizador já se encontra com a conta bloqueada.");
            }

            try
            {
                user.IsBlocked = true;
                _context.Users.Update(user);

                var report = await _context.Report.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (report == null)
                {
                    return NotFound();
                }

                report.State = ReportState.Concluded;
                _context.Report.Update(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta bloqueada com sucesso."});
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao bloquear conta.");
            }
        }

        [HttpPatch("suspend-account-patient")]
        public async Task<ActionResult> SuspendAccountPatient(ReportDto model)
        {
            var user = await _userManager.FindByIdAsync(model.IdPatient);

            if (user == null) { return NotFound("Não foi possível encontrar o utilizador"); }

            if (user.IsSuspended)
            {
                return BadRequest("Utilizador já se encontra com a conta suspensa");
            }

            try
            {
                user.IsSuspended = true;
                _context.Users.Update(user);
                await _userManager.SetLockoutEndDateAsync(user, model.BanTime.Date);

                var report = await _context.Report.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (report == null)
                {
                    return NotFound();
                }

                report.State = ReportState.Concluded;
                _context.Report.Update(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta suspensa com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao suspender conta.");
            }
        }

        [HttpPatch("block-account-patient")]
        public async Task<ActionResult> BlockAccountPatient(ReportDto model)
        {
            var user = await _userManager.FindByIdAsync(model.IdPatient);

            if (user == null) { return NotFound("Não foi possível encontrar o utilizador."); }

            if (user.IsBlocked)
            {
                return BadRequest("Utilizador já se encontra com a conta bloqueada.");
            }

            try
            {
                user.IsBlocked = true;
                _context.Users.Update(user);

                var report = await _context.Report.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (report == null)
                {
                    return NotFound();
                }

                report.State = ReportState.Concluded;
                _context.Report.Update(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta bloqueada com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao bloquear conta.");
            }
        }
    }
}
