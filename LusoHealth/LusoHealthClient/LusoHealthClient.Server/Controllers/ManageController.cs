using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LusoHealthClient.Server.Controllers
{
    [Authorize(Roles = SD.AdminRole + "," + SD.ManagerRole)]
    [Route("api/[controller]")]
    [ApiController]
    public class ManageController : ControllerBase
    {
    }
}
