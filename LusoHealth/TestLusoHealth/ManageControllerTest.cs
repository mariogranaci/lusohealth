using LusoHealthClient.Server.Controllers;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Administration;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace TestLusoHealth
{
	public class ManageControllerTest:IClassFixture<ApplicationDbContextFixture>
	{
		private readonly User testUser;
		private readonly User testUser1;
		private readonly ApplicationDbContext _context;


		public ManageControllerTest(ApplicationDbContextFixture fixture)
		{
			_context = fixture.DbContext;
			testUser = fixture.TestUser;
			testUser1 = fixture.TestUser1;
		}

		//Testes cancelar consulta
		[Fact]
		public async Task TestConcludeReport_ReturnsNotFound_WhenReportDontExist()
		{
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => null);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto
			{
				
			};

			var result = await controller.ConcludeReport(report1);

			Assert.IsType<NotFoundResult>(result);
		}


		[Fact]
		public async Task TestConcludeReport_ReturnsOkObjectResult_WhenReportExist()
		{
			//var userManegar UserManager<LusoHealthClient.Server.Models.Users.User> _userManager;
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => null);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto {Id=1, Timestamp = DateTime.Now, 
				IdPatient = "1", IdProfesional = "1", 
				Description = "Não apareceu a consulta e fiquei sem o dinheiro.", State = ReportState.Pending };

			var result = await controller.ConcludeReport(report1);

			Assert.IsType<OkObjectResult>(result);
		}


		//Testes suspender  a conta do profissional
		[Fact]
		public async Task TestSuspendAccountProfessional_ReturnsBadRequestObjectResult_WhenUserExist()
		{
			//var userManegar UserManager<LusoHealthClient.Server.Models.Users.User> _userManager;
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser1);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto
			{
				
			};

			var result = await controller.SuspendAccountProfessional(report1);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestSuspendAccountProfessional_ReturnsOkObjectResult_WhenReportExist()
		{
			//var userManegar UserManager<LusoHealthClient.Server.Models.Users.User> _userManager;
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				IdPatient = "1",
				IdProfesional = "1",
				Description = "Não apareceu a consulta e fiquei sem o dinheiro.",
				State = ReportState.Pending
			};

			var result = await controller.SuspendAccountProfessional(report1);

			Assert.IsType<OkObjectResult>(result);
		}


		//Testes bloquear a conta do profissional
		[Fact]
		public async Task TestBlockAccountProfessional_ReturnsBadRequestObjectResult_WhenUserExist()
		{
			//var userManegar UserManager<LusoHealthClient.Server.Models.Users.User> _userManager;
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser1);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto
			{

			};

			var result = await controller.BlockAccountProfessional(report1);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestBlockAccountProfessional_ReturnsOkObjectResult_WhenUserExist()
		{
			//var userManegar UserManager<LusoHealthClient.Server.Models.Users.User> _userManager;
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var report1 = new ReportDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				IdPatient = "1",
				IdProfesional = "1",
				Description = "Não apareceu a consulta e fiquei sem o dinheiro.",
				State = ReportState.Pending
			};

			var result = await controller.BlockAccountProfessional(report1);

			Assert.IsType<OkObjectResult>(result);
		}


		//Testes suspender a conta do paciente
		[Fact]
		public async Task TestSuspendAccountPatient_ReturnsBadRequestObjectResult_WhenUserExist()
		{
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser1);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var review = new ReviewAdminDto
			{

			};

			var result = await controller.SuspendAccountPatient(review);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestSuspendAccountPatient_ReturnsOkObjectResult_WhenUserExist()
		{
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var review = new ReviewAdminDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				IdPatient = "1",
				IdService = 1,
				Description = "Não apareceu a consulta e fiquei sem o dinheiro.",
				Stars = 5
			};

			var result = await controller.SuspendAccountPatient(review);

			Assert.IsType<OkObjectResult>(result);
		}


		//Testes bloquear a conta do paciente
		[Fact]
		public async Task TestBlockAccountPatient_ReturnsBadRequestObjectResult_WhenUserExist()
		{
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser1);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var review = new ReviewAdminDto
			{
				
			};

			var result = await controller.BlockAccountPatient(review);

			Assert.IsType<BadRequestObjectResult>(result);
		}




		[Fact]
		public async Task TestBlockAccountPatient_ReturnsOkObjectResult_WhenUserExist()
		{
			var mockUserManager = new Mock<UserManager<User>>(new Mock<IUserStore<User>>().Object,
			   new Mock<IOptions<IdentityOptions>>().Object,
			   new Mock<IPasswordHasher<User>>().Object,
			   new IUserValidator<User>[0],
			   new IPasswordValidator<User>[0],
			   new Mock<ILookupNormalizer>().Object,
			   new Mock<IdentityErrorDescriber>().Object,
			   new Mock<IServiceProvider>().Object,
			   new Mock<ILogger<UserManager<User>>>().Object);
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
										new Claim(ClaimTypes.NameIdentifier, "professionaltest@mail.com"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new ManageController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var review = new ReviewAdminDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				IdPatient = "1",
				IdService = 1,
				Description = "Não apareceu a consulta e fiquei sem o dinheiro.",
				Stars = 5
			};

			var result = await controller.BlockAccountPatient(review);

			Assert.IsType<OkObjectResult>(result);
		}


	}
}
