using LusoHealthClient.Server.Controllers;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Agenda;
using LusoHealthClient.Server.DTOs.Appointments;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Services;
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
	public class AppointmentControllerTest : IClassFixture<ApplicationDbContextFixture>
	{
		private readonly User testUser;
		private readonly ApplicationDbContext _context;


		public AppointmentControllerTest(ApplicationDbContextFixture fixture)
		{
			_context = fixture.DbContext;
			testUser = fixture.TestUser;
		}

		//Testes Cancelar e Rejeitar Consulta

		[Fact]
		public async Task TestCancelAppointment_ReturnsBadRequest_WhenAppointmentDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var result = await controller.CancelAppointment(null);

			Assert.IsType<BadRequestObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestCancelAppointment_ReturnsNotFound_WhenAppointmentDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var appointmentDto = new AppointmentDto
			{
				
			};

			var result = await controller.CancelAppointment(appointmentDto);

			Assert.IsType<NotFoundObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestCancelAppointment_ReturnsCancelModel_WhenAppointmentExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var appointmentDto = new AppointmentDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				State = "Pending"
			};

			var result = await controller.CancelAppointment(appointmentDto);

			Assert.IsType<ActionResult<AppointmentDto>>(result);
		}


		//Testes Aceitar Consulta

		[Fact]
		public async Task TestScheduleAppointment_ReturnsBadRequest_WhenAppointmentDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var result = await controller.AcceptAppointment(null);

			Assert.IsType<BadRequestObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestScheduleAppointment_ReturnsNotFound_WhenAppointmentDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var appointmentDto = new AppointmentDto
			{
				
			};

			var result = await controller.AcceptAppointment(appointmentDto);

			Assert.IsType<NotFoundObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestScheduleAppointment_ReturnsUpdateModel_WhenAppointmentExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var appointmentDto = new AppointmentDto
			{
				Id = 1,
				Timestamp = DateTime.Now,
				State = "Pending"
			};

			var result = await controller.AcceptAppointment(appointmentDto);

			Assert.IsType<ActionResult<AppointmentDto>>(result);
		}


		//Testes Alterar Consulta

		[Fact]
		public async Task TestChangeAppointment_ReturnsBadRequest_WhenModelDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };


			var result = await controller.ChangeAppointment(null);

			Assert.IsType<BadRequestObjectResult>(result.Result);
		}

		[Fact]
		public async Task TestChangeAppointment_ReturnsNotFound_WhenAppointmentDontExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilitySlot = new AvailableSlotDto
			{
				
			};

			var result = await controller.ChangeAppointment(availabilitySlot);

			Assert.IsType<NotFoundObjectResult>(result.Result);
		}



		[Fact]
		public async Task TestChangeAppointment_ReturnsUpdateModel_WhenAppointmentExist()
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

			var controller = new AppointmentController(_context, mockUserManager.Object);
			controller.ControllerContext = new ControllerContext();
			controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };

			var availabilitySlot = new AvailableSlotDto
			{
				Id = 1,
				Start = DateTime.Now,
				SlotDuration = 10,
				IdService = 1,
				AppointmentType = "Online",
				IsAvailable = true,
				AppointmentId = 1
			};

			var result = await controller.ChangeAppointment(availabilitySlot);

			Assert.IsType<ActionResult<AvailableSlot>>(result);
		}
	}
}


