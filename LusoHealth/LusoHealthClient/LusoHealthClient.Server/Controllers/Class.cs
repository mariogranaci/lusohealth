using LusoHealthClient.Server.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
            /*private readonly UserManager<User> _userManager;
            */
            public BackOfficeController(ApplicationDbContext context/*, UserManager<User> userManager*/)
            {
                _context = context;
               // _userManager = userManager;
            }

            //[HttpGet("get-users")]

            //[HttpGet("get-professionals")]

            //[HttpGet("get-professionals/{}")]
        }
    }
}
