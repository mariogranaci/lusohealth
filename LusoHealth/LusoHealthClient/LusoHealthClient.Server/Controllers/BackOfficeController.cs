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

            [HttpGet("get-users")]
            public async Task<ActionResult<User>> GetUsers()
            {
                var users = await _context.Users.ToListAsync();
                if (users == null) return BadRequest("Não foi possível encontrar a informação dos utilizadores.");
                return Ok(users);
            }



            //[HttpGet("get-professionals")]

            //[HttpGet("get-professionals/{}")]
        }
    }
}
