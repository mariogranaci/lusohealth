using LusoHealthClient.Server.Controllers;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Moq;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;
using LusoHealthClient.Server.DTOs.Agenda;
using LusoHealthClient.Server.DTOs.Appointments;
using Microsoft.AspNetCore.Http.HttpResults;
using LusoHealthClient.Server.Models.Professionals;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace TestLusoHealth
{
	
	public class AgendaControllerTest : IClassFixture<ApplicationDbContextFixture>
	{
		private readonly User testUser ;
		private readonly ApplicationDbContext _context;
		

		public AgendaControllerTest(ApplicationDbContextFixture fixture)
		{
			_context = fixture.DbContext;
			testUser = fixture.TestUser;
		}

		//Testes Consultas agendadas

		[Fact]
		public async Task TestGetNextAppointments_ReturnsNotFound_WhenUserDontExist()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var result =  await controller.GetNextAppointments();

			Assert.IsType<NotFoundObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestGetNextAppointments_ReturnListAppointments_WhenUserExist()
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
										new Claim(ClaimTypes.Role, "Professional"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };


			var result = await controller.GetNextAppointments();

			Assert.IsType<ActionResult<List<Appointment>>>(result);

		}


		//Testes Histórico de consultas

		[Fact]
		public async Task TestGetPreviousAppointments_ReturnsNotFound_WhenUserDontExist()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var result = await controller.GetPreviousAppointments();

			Assert.IsType<NotFoundObjectResult>(result.Result);
		}



		[Fact]
		public async Task TestGetPreviousAppointments_ReturnListAppointments_WhenUserExist()
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
										new Claim(ClaimTypes.Role, "Professional"),
								   }, "TestAuthentication"));

			mockUserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>()))
				.ReturnsAsync((string userId) => testUser);

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };


			var result = await controller.GetPreviousAppointments();

			Assert.IsType<ActionResult<List<Appointment>>>(result);

		}


		// Testes Adicionar Disponibilidade

		[Fact]
		public async Task TestAddAvailability_ReturnsBadRequest_WhenAppointmentIsNull()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				 
			};

			var result = await controller.AddAvailability(availabilityDto);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestAddAvailability_ReturnsBadRequest_WhenStartDateBiggerEndDate()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				StartDate = DateTime.Now.Date,
				EndDate = DateTime.Now.Date.AddDays(- 1),
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.Date.AddDays(-1),
				ServiceId = 1,
				SlotDuration = 10,
				Type = "Online"
			};

			var result = await controller.AddAvailability(availabilityDto);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestAddAvailability_ReturnsBadRequest_WhenStartTimeBiggerEndTime()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				StartDate = DateTime.Now.Date,
				EndDate = DateTime.Now.Date.AddDays(+1),
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.Date.AddDays(-1),
				ServiceId = 1,
				SlotDuration = 10,
				Type = "Online"
			};

			var result = await controller.AddAvailability(availabilityDto);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestAddAvailability_ReturnsOK_WhenAvailabilityExists()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				StartDate = DateTime.Now.Date,
				EndDate = DateTime.Now.Date.AddDays(+1),
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.Date.AddDays(+1),
				ServiceId = 1,
				SlotDuration = 10,
				Type = "Online"
			};

			var result = await controller.AddAvailability(availabilityDto);

			Assert.IsType<OkObjectResult>(result);
		}


		//Testes de Delete 
		[Fact]
		public async Task TestDeleteAvailability_ReturnsBadRequest_WhenStartDateBiggerEndDate()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				StartDate = DateTime.Now.Date,
				EndDate = DateTime.Now.Date.AddDays(-1),
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.Date.AddDays(-1),
				ServiceId = 1,
				SlotDuration = 10,
				Type = "Online"
			};

			var result = await controller.DeleteSlots(availabilityDto);

			Assert.IsType<BadRequestObjectResult>(result);
		}


		[Fact]
		public async Task TestDeleteAvailability_ReturnsOK_WhenAvailabilityExists()
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

			var controller = new AgendaController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilityDto = new AvailabilityDto
			{
				StartDate = DateTime.Now.Date,
				EndDate = DateTime.Now.Date.AddDays(+1),
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.Date.AddDays(+1),
				ServiceId = 1,
				SlotDuration = 10,
				Type = "Online"
			};

			var result = await controller.DeleteSlots(availabilityDto);

			Assert.IsType<OkObjectResult>(result);
		}
	}
}
