using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Identity;
//using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;

using Stripe;
using System;


namespace TestLusoHealth
{
	public class ApplicationDbContextFixture : IDisposable
	{
		//public IServiceProvider ServiceProvider { get; private set; }
		public ApplicationDbContext DbContext { get; private set; }

		public User TestUser { get;  set; }



		public ApplicationDbContextFixture()
		{


			/*var connection = new SqliteConnection("DataSource=:memory:");
			connection.Open();*/
			var options = new DbContextOptionsBuilder<ApplicationDbContext>()
					/*.UseSqlite(connection)*/
					.UseInMemoryDatabase(databaseName:"base-dados-lusohealth")
					.Options;
			DbContext = new ApplicationDbContext(options);

			DbContext.Database.EnsureCreated();



			User user1 = new User
			{
				//Id = Guid.NewGuid().ToString(),
				FirstName = "User",
				LastName = "Test",
				Email = "usertest@mail.com",
				NormalizedEmail = "usertest@mail.com".ToUpper(),
				Gender = 'M',
				Nif = "123456798",
				UserType = 'U',
				PhoneNumber = null,
				PhoneNumberConfirmed = false,
				IsSuspended = false,
				IsBlocked = false,
				ProfilePicPath = null,
				TwoFactorEnabled = false,
				LockoutEnabled = false,
				AccessFailedCount = 0,
				UserName = "usertest@mail.com",
				BirthDate = new DateTime(1990, 1, 1),
			};

			User user2 = new User
			{
				//Id = Guid.NewGuid().ToString(),
				FirstName = "Professional",
				LastName = "Test",
				Email = "professionaltest@mail.com",
				NormalizedEmail = "professionaltest@mail.com".ToUpper(),
				Gender = 'M',
				Nif = "123456798",
				UserType = 'P',
				PhoneNumber = null,
				PhoneNumberConfirmed = false,
				EmailConfirmed = true,
				IsSuspended = false,
				IsBlocked = false,
				ProfilePicPath = null,
				TwoFactorEnabled = false,
				LockoutEnabled = false,
				AccessFailedCount = 0,
				UserName = "professionaltest@mail.com",
				BirthDate = new DateTime(1990, 1, 1)
			};

			TestUser = user2;

			DbContext.Users.AddRange(user1, user2);

			Patient patient1 = new Patient
			{
				UserID = user1.Id		
			};

			/*ProfessionalType professionalType1 = new ProfessionalType
			{
				Id = 1,
				Name = "Médico",
			};

			DbContext.ProfessionalTypes.Add(professionalType1);*/
			

			Professional professional1 = new Professional
			{
				UserID = user2.Id,
				ProfessionalTypeId = 1,
				
			};

			DbContext.Patients.Add(patient1);
			DbContext.Professionals.Add(professional1) ;
			

			/*Specialty specialty1 = new Specialty 
			{
				Id = 1,
				Name = "Anatomia Patológica",
				ProfessionalTypeId = 1,
				TimesScheduled = 0
			};

			DbContext.Specialties.Add(specialty1);*/

			

			Service service1 = new Service
			{
				Id = 1,
				IdProfessional = user2.Id,
				IdSpecialty = 10,
				PricePerHour = 12,
				Online = true,
				Presential = false,
				Home = true
			};

			DbContext.Services.Add(service1);

			Random random = new Random();
			DateTime dataAtual = DateTime.Now;
			int diasAleatorios = random.Next(0, 366);
			int diasAleatoriosFuturos = random.Next(150, 366);

			Appointment appointment1 = new Appointment
			{
				Id= 1,
				Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
				Type = AppointmentType.Online,
				State = AppointmentState.Scheduled,
				Duration = 1,
				IdProfesional = user2.Id,
				IdPatient = user1.Id,
				IdService = service1.Id
			};

			DbContext.Appointment.Add(appointment1);

			DbContext.Appointment.Add(new Appointment
			{
				Id= 2,
				Timestamp = dataAtual.AddDays(-diasAleatorios),
				Type = AppointmentType.Online,
				State = AppointmentState.Scheduled,
				Duration = 1,
				IdProfesional = user2.Id,
				IdPatient = user1.Id,
				IdService = service1.Id
			});

			DbContext.AvailableSlots.Add(new AvailableSlot { Id = 1 , Start = DateTime.Now , SlotDuration = 10 , IdService = service1.Id,
				AppointmentType =  AppointmentType.Online , IsAvailable = true ,AppointmentId = appointment1.Id });

			
			DbContext.SaveChanges();

		}

		public void Dispose() => DbContext.Dispose();

	}
}
