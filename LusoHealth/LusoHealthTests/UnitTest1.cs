using Fluent.Infrastructure.FluentModel;
using LusoHealthClient.Server.Controllers;
using LusoHealthClient.Server.Models.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LusoHealthClient.Server.Models.Users;

namespace LusoHealthTests
{
	public class UnitTest1
	{
		[Fact]
		public async Task Test1Async()
		{
			// Configura��o
			var mockUserManager = new Mock<UserManager>(); // Configure o UserManager mock conforme necess�rio
			var mockContext = new Mock<ApplicationDbContext>(); // Substitua YourDbContext pelo nome do seu DbContext
			var user = new User { Id = "testUserId" }; // Crie um usu�rio de teste
			var appointments = new List<Appointment>
		{
			new Appointment { Timestamp = DateTime.UtcNow.AddHours(1), State = AppointmentState.Scheduled, IdPatient = "testUserId" },
			new Appointment { Timestamp = DateTime.UtcNow.AddHours(-1), State = AppointmentState.Scheduled, IdPatient = "testUserId" }, // Passado
            new Appointment { Timestamp = DateTime.UtcNow.AddHours(2), State = AppointmentState.Done, IdPatient = "testUserId" } // Cancelado
        };

			// Mock do DbSet
			var mockSet = new Mock<DbSet<Appointment>>();
			// Configure o mockSet com os appointments

			// Mock do UserManager para retornar o usu�rio de teste
			// Mock do Context para retornar o mockSet quando Appointment for acessado

			var controller = new AgendaController(mockContext.Object, mockUserManager.Object);
			// Simule a autentica��o do usu�rio aqui, se necess�rio

			// A��o
			var result = await controller.getNextAppointments();

			// Assertiva
			var actionResult = Assert.IsType<ActionResult<List<Appointment>>>(result);
			var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
			var returnedAppointments = Assert.IsType<List<Appointment>>(okResult.Value);

			Assert.Single(returnedAppointments); // Verifica se apenas um appointment v�lido � retornado
			Assert.Equal(DateTime.UtcNow.AddHours(1), returnedAppointments[0].Timestamp); // Verifica se o appointment retornado � o futuro e agendado
		}
	}

	}
}