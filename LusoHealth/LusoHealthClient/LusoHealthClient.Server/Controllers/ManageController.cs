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
	/// <summary>
	/// Controlador responsável por gerir relatórios, análises e ações administrativas.
	/// </summary>
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

		/// <summary>
		/// Obtém uma lista paginada de relatórios.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de relatórios por página.</param>
		/// <returns>Uma lista paginada de relatórios.</returns>
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

		/// <summary>
		/// Obtém uma lista paginada de relatórios cancelados.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de relatórios por página.</param>
		/// <returns>Uma lista paginada de relatórios cancelados.</returns>
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

		/// <summary>
		/// Obtém uma lista paginada de relatórios concluídos.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de relatórios por página.</param>
		/// <returns>Uma lista paginada de relatórios concluídos.</returns>
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

		/// <summary>
		/// Obtém uma lista paginada de relatórios pendentes.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de relatórios por página.</param>
		/// <returns>Uma lista paginada de relatórios pendentes.</returns>
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

		// <summary>
		/// Conclui um relatório, alterando seu estado para cancelado.
		/// </summary>
		/// <param name="model">As informações do relatório a ser cancelado.</param>
		/// <returns>Um ActionResult representando o resultado da operação de conclusão do relatório.</returns>
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

		/// <summary>
		/// Suspende a conta de um profissional e conclui um relatório associado a essa ação.
		/// </summary>
		/// <param name="model">As informações do relatório e do profissional cuja conta será suspensa.</param>
		/// <returns>Um ActionResult representando o resultado da operação de suspensão de conta.</returns>
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
                await _userManager.SetLockoutEndDateAsync(user, DateTime.Now.AddDays(7));

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

		/// <summary>
		/// Bloqueia a conta de um profissional e conclui um relatório associado a essa ação.
		/// </summary>
		/// <param name="model">As informações do relatório e do profissional cuja conta será bloqueada.</param>
		/// <returns>Um ActionResult representando o resultado da operação de bloqueio de conta.</returns>
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

		/// <summary>
		/// Suspende a conta de um paciente e exclui uma Review associada a essa ação.
		/// </summary>
		/// <param name="model">As informações da Review e do paciente cuja conta será suspensa.</param>
		/// <returns>Um ActionResult representando o resultado da operação de suspensão de conta.</returns>
		[HttpPatch("suspend-account-patient")]
        public async Task<ActionResult> SuspendAccountPatient(ReviewAdminDto model)
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
                await _userManager.SetLockoutEndDateAsync(user, DateTime.Now.AddDays(5));

                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (review == null)
                {
                    return NotFound();
                }

                review.State = ReviewState.Deleted;
                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta suspensa com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao suspender conta.");
            }
        }

		/// <summary>
		/// Bloqueia a conta de um paciente e exclui uma Review associada a essa ação.
		/// </summary>
		/// <param name="model">As informações da Review e do paciente cuja conta será bloqueada.</param>
		/// <returns>Um ActionResult representando o resultado da operação de bloqueio de conta.</returns>
		[HttpPatch("block-account-patient")]
        public async Task<ActionResult> BlockAccountPatient(ReviewAdminDto model)
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

                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == model.Id);

                if (review == null)
                {
                    return NotFound();
                }

                review.State = ReviewState.Deleted;
                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta bloqueada com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao bloquear conta.");
            }
        }

		/// <summary>
		/// Obtém uma lista paginada de Reviews.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de Reviews por página.</param>
		/// <returns>Uma lista paginada de Reviews.</returns>
		[Authorize]
        [HttpGet("get-reviews/{offset}/{limit}")]
        public async Task<ActionResult<List<ReviewAdminDto>>> GetReviews(int offset, int limit)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Select(r => new ReviewAdminDto
                    {
                        Id = r.Id,
                        Timestamp = r.Timestamp,
                        IdPatient = r.IdPatient,
                        IdService = r.IdService,
                        State = r.State,
                        Stars = r.Stars,
                        Description = r.Description

                    })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reviews == null || reviews.Count == 0)
                {
                    return NotFound("No more reviews available.");
                }

                return reviews;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving reviews.");
            }
        }

		/// <summary>
		/// Obtém uma lista paginada de Reviews reportadas.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de Reviews por página.</param>
		/// <returns>Uma lista paginada de Reviews reportadas.</returns>
		[Authorize]
        [HttpGet("get-reviews-reported/{offset}/{limit}")]
        public async Task<ActionResult<List<ReviewAdminDto>>> GetReviewsReported(int offset, int limit)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.State == ReviewState.Reported)
                    .Select(r => new ReviewAdminDto
                    {
                        Id = r.Id,
                        Timestamp = r.Timestamp,
                        IdPatient = r.IdPatient,
                        IdService = r.IdService,
                        State = r.State,
                        Stars = r.Stars,
                        Description = r.Description

                    })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reviews == null || reviews.Count == 0)
                {
                    return NotFound("No more reviews available.");
                }

                return reviews;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter reviews cancelados.");
            }
        }

		/// <summary>
		/// Obtém uma lista paginada de Reviews excluídas.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de Reviews por página.</param>
		/// <returns>Uma lista paginada de Reviews excluídas.</returns>
		[Authorize]
        [HttpGet("get-reviews-deleted/{offset}/{limit}")]
        public async Task<ActionResult<List<ReviewAdminDto>>> GetReviewsDeleted(int offset, int limit)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.State == ReviewState.Deleted)
                    .Select(r => new ReviewAdminDto
                    {
                        Id = r.Id,
                        Timestamp = r.Timestamp,
                        IdPatient = r.IdPatient,
                        IdService = r.IdService,
                        State = r.State,
                        Stars = r.Stars,
                        Description = r.Description

                    })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reviews == null || reviews.Count == 0)
                {
                    return NotFound("No more reviews available.");
                }

                return reviews;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter reviews cancelados.");
            }
        }

		/// <summary>
		/// Obtém uma lista paginada de Reviews normais.
		/// </summary>
		/// <param name="offset">O deslocamento da página.</param>
		/// <param name="limit">O limite de Reviews por página.</param>
		/// <returns>Uma lista paginada de Reviews normais.</returns>
		[Authorize]
        [HttpGet("get-reviews-normal/{offset}/{limit}")]
        public async Task<ActionResult<List<ReviewAdminDto>>> GetReviewsNormal(int offset, int limit)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.State == ReviewState.Normal)
                    .Select(r => new ReviewAdminDto
                    {
                        Id = r.Id,
                        Timestamp = r.Timestamp,
                        IdPatient = r.IdPatient,
                        IdService = r.IdService,
                        State = r.State,
                        Stars = r.Stars,
                        Description = r.Description

                    })
                   .Skip(offset)
                   .Take(limit)
                   .ToListAsync();

                if (reviews == null || reviews.Count == 0)
                {
                    return NotFound("No more reviews available.");
                }

                return reviews;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter reviews cancelados.");
            }
        }

		/// <summary>
		/// Apaga uma Review, alterando seu estado para deletado.
		/// </summary>
		/// <param name="model">As informações da Review a ser apagada.</param>
		/// <returns>Um ActionResult representando o resultado da operação de exclusão da Review.</returns>
		[HttpPatch("delete-review")]
        public async Task<ActionResult> DeleteReview(ReviewAdminDto model)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == model.Id);

            if (review == null)
            {
                return NotFound();
            }

            try
            {
                review.State = ReviewState.Deleted;
                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Review apagada." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao apagar review 🧀.");
            }

        }
    }
}
