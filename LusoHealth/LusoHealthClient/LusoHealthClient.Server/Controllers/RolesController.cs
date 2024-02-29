using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LusoHealthClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        #region Roles
        [HttpGet("admin-role")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminRole()
        {
            return Ok("Admin role");
        }

        [HttpGet("manager-role")]
        [Authorize(Roles = "Manager")]
        public IActionResult ManagerRole()
        {
            return Ok("Manager role");
        }

        [HttpGet("patient-role")]
        [Authorize(Roles = "Patient")]
        public IActionResult PatientRole()
        {
            return Ok("Patient role");
        }

        [HttpGet("professional-role")]
        [Authorize(Roles = "Professional")]
        public IActionResult ProfessionalRole()
        {
            return Ok("Professional role");
        }
        #endregion

        #region Policy
        [HttpGet("admin-policy")]
        [Authorize(policy: "AdminPolicy")]
        public IActionResult AdminPolicy()
        {
            return Ok("Admin policy");
        }

        [HttpGet("manager-policy")]
        [Authorize(policy: "ManagerPolicy")]
        public IActionResult ManagerPolicy()
        {
            return Ok("Manager policy");
        }

        [HttpGet("patient-policy")]
        [Authorize(policy: "PatientPolicy")]
        public IActionResult PatientPolicy()
        {
            return Ok("Patient policy");
        }

        [HttpGet("professional-policy")]
        [Authorize(policy: "ProfessionalPolicy")]
        public IActionResult ProfessionalPolicy()
        {
            return Ok("Professional policy");
        }
        #endregion
    }
}
