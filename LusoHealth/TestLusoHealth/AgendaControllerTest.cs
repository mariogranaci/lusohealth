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

		//teste Consultas agendadas

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


		// Teste Histórico de consultas

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




		/*[Fact]
        public void GetUserTest_IsInRole()
		{
			// Arranjo
			var user = new GameUser { *//* inicialize seu GameUser aqui *//* };
			var claims = new List<Claim> {
				new Claim(ClaimTypes.Name, user.Name),
				new Claim(ClaimTypes.Role, "RoleEspecifica"), // Adicione a role específica aqui
                // Adicione outras claims necessárias
            };
			var identity = new ClaimsIdentity(claims, "TestAuthType");
			var claimsPrincipal = new ClaimsPrincipal(identity);

			var controller = new GameController(); // Substitua GameController pelo nome real do seu controlador
			controller.ControllerContext = new ControllerContext
			{
				HttpContext = new DefaultHttpContext { User = claimsPrincipal }
			};

			// Ação
			var result = controller.SomeAction(); // SomeAction é a ação que você quer testar

			// Assertiva
			Assert.NotNull(result);
			// Verifique se a lógica que depende de User.IsInRole("RoleEspecifica") funciona como esperado
			// Por exemplo, se SomeAction retorna algo diferente baseado em User.IsInRole, você pode verificar isso aqui
		}*/


	}
}
