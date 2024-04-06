﻿using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Administration;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        private readonly ILogger<ProfileController> _logger;

        public ManageController(ApplicationDbContext context, UserManager<User> userManager, ILogger<ProfileController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        [Authorize]
        [HttpGet("get-reports")]
        public async Task<ActionResult<List<ReportDto>>> GetAllReports()
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
                   .ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return BadRequest("Não foi possível encontrar nenhum relatório.");
                }

                return reports;
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao obter reports.");
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
                report.State = ReportState.Cancel;
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
