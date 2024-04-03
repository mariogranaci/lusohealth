using Fluent.Infrastructure.FluentModel;
using LusoHealthClient.Server.Controllers;
using LusoHealthClient.Server.Models.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LusoHealthClient.Server.Models.Users;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LusoHealthTests
{
	public class UnitTest1
	{
		[Fact]
		public async Task Test1()
		{
			// Configuração
			var user = new User { Id = "3" };
			var appointments = new List<Appointment>
			{
				new Appointment { Timestamp = DateTime.UtcNow.AddHours(1), State = AppointmentState.Scheduled, IdPatient = "3" },
				new Appointment { Timestamp = DateTime.UtcNow.AddHours(-1), State = AppointmentState.Scheduled, IdPatient = "3" },
				new Appointment { Timestamp = DateTime.UtcNow.AddHours(2), State = AppointmentState.Done, IdPatient = "3" } // Cancelado
            };

			var mockSet = new Mock<DbSet<Appointment>>();
			mockSet.As<IQueryable<Appointment>>().Setup(m => m.Provider).Returns(appointments.AsQueryable().Provider);
			mockSet.As<IQueryable<Appointment>>().Setup(m => m.Expression).Returns(appointments.AsQueryable().Expression);
			mockSet.As<IQueryable<Appointment>>().Setup(m => m.ElementType).Returns(appointments.AsQueryable().ElementType);
			mockSet.As<IQueryable<Appointment>>().Setup(m => m.GetEnumerator()).Returns(appointments.GetEnumerator());

			var mockContext = new Mock<ApplicationDbContext>();
			mockContext.Setup(c => c.Appointments).Returns(mockSet.Object);

			var mockUserManager = new Mock<UserManager<User>>(MockBehavior.Strict);

			var controller = new AgendaController(mockContext.Object, mockUserManager.Object);

			// Ação
			var result = await controller.getNextAppointments();

			// Assertiva
			var actionResult = Assert.IsType<ActionResult<List<Appointment>>>(result);
			var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
			var returnedAppointments = Assert.IsType<List<Appointment>>(okResult.Value);

			Assert.Single(returnedAppointments); // Verifica se apenas um appointment válido é retornado
			Assert.Equal(DateTime.UtcNow.AddHours(1), returnedAppointments[0].Timestamp); // Verifica se o appointment retornado é o futuro e agendado
		}
	}
}
