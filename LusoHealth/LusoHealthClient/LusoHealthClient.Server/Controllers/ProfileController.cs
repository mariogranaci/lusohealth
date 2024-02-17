using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LusoHealthClient.Server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ProfileController : ControllerBase
	{

		private readonly ApplicationDbContext _context;

	}
}
