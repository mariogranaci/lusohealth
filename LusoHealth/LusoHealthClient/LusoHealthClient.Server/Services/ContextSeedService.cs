using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LusoHealthClient.Server.Services
{
	public class ContextSeedService
	{
		private readonly UserManager<User> _userManager;
		private readonly RoleManager<IdentityRole> _roleManager;
		private readonly ApplicationDbContext _context;

		public ContextSeedService(ApplicationDbContext context,
			UserManager<User> userManager,
			RoleManager<IdentityRole> roleManager)
		{
			_userManager = userManager;
			_roleManager = roleManager;
			_context = context;
		}

		public async Task InitializeProductionAsync()
		{
			if (_context.Database.GetPendingMigrationsAsync().GetAwaiter().GetResult().Count() > 0)
			{
				//apply any pending migrations into our database
				await _context.Database.MigrateAsync();
			}

			if (!_roleManager.Roles.Any())
			{
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.AdminRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.ManagerRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.PatientRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.ProfessionalRole });
			}

			if (!_userManager.Users.AnyAsync().GetAwaiter().GetResult())
			{
				PasswordHasher<User> ph = new PasswordHasher<User>();
				var admin = new User
				{
					FirstName = "Admin",
					LastName = "User",
					Email = "admin@admin.com",
					NormalizedEmail = "admin@admin.com",
					Gender = 'M',
					Nif = "123456798",
					UserType = 'A',
					PhoneNumber = null,
					PhoneNumberConfirmed = false,
					IsSuspended = false,
					IsBlocked = false,
					ProfilePicPath = null,
					TwoFactorEnabled = false,
					LockoutEnabled = false,
					AccessFailedCount = 0,
					UserName = "123456798_" + DateTime.Now.Millisecond,
					BirthDate = new DateTime(1990, 1, 1),
				};
				await _userManager.CreateAsync(admin, "Pass1234");
				await _userManager.AddToRoleAsync(admin, SD.AdminRole);
				await _userManager.AddClaimsAsync(admin,
				[
					new Claim(ClaimTypes.NameIdentifier, admin.Id),
					new Claim(ClaimTypes.Email, admin.Email),
					new Claim(ClaimTypes.Name, admin.FirstName + " " + admin.LastName)
				]);

				var manager = new User
				{
					FirstName = "Manager",
					LastName = "User",
					Email = "manager@manager.com",
					NormalizedEmail = "manager@manager.com",
					Gender = 'M',
					Nif = "123456798",
					UserType = 'M',
					PhoneNumber = null,
					PhoneNumberConfirmed = false,
					IsSuspended = false,
					IsBlocked = false,
					ProfilePicPath = null,
					TwoFactorEnabled = false,
					LockoutEnabled = false,
					AccessFailedCount = 0,
					UserName = "123456798_" + DateTime.Now.Millisecond,
					BirthDate = new DateTime(1990, 1, 1),
				};
				await _userManager.CreateAsync(manager, "Pass1234");
				await _userManager.AddToRoleAsync(manager, SD.ManagerRole);
				await _userManager.AddClaimsAsync(manager,
				[
					new Claim(ClaimTypes.NameIdentifier, manager.Id),
					new Claim(ClaimTypes.Email, manager.Email),
					new Claim(ClaimTypes.Name, manager.FirstName + " " + manager.LastName)
				]);
			}
		}

		public async Task InitializeContextAsync()
		{
			if (_context.Database.GetPendingMigrationsAsync().GetAwaiter().GetResult().Count() > 0)
			{
				// apply any pending migrations into our database
				await _context.Database.MigrateAsync();
			}

			if (!_roleManager.Roles.Any())
			{
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.AdminRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.ManagerRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.PatientRole });
				await _roleManager.CreateAsync(new IdentityRole { Name = SD.ProfessionalRole });
			}

			if (!_userManager.Users.AnyAsync().GetAwaiter().GetResult())
			{
				PasswordHasher<User> ph = new PasswordHasher<User>();
				var admin = new User
				{
					FirstName = "Admin",
					LastName = "User",
					Email = "admin@admin.com",
					NormalizedEmail = "admin@admin.com",
					Gender = 'M',
					Nif = "123456798",
					UserType = 'A',
					PhoneNumber = null,
					PhoneNumberConfirmed = false,
					IsSuspended = false,
					IsBlocked = false,
					ProfilePicPath = null,
					TwoFactorEnabled = false,
					LockoutEnabled = false,
					AccessFailedCount = 0,
					UserName = "123456798_" + DateTime.Now.Millisecond,
					BirthDate = new DateTime(1990, 1, 1),
				};
				await _userManager.CreateAsync(admin, "Pass1234");
				await _userManager.AddToRoleAsync(admin, SD.AdminRole);
				await _userManager.AddClaimsAsync(admin,
				[
					new Claim(ClaimTypes.NameIdentifier, admin.Id),
					new Claim(ClaimTypes.Email, admin.Email),
					new Claim(ClaimTypes.Name, admin.FirstName + " " + admin.LastName)
				]);

				var manager = new User
				{
					FirstName = "Manager",
					LastName = "User",
					Email = "manager@manager.com",
					NormalizedEmail = "manager@manager.com",
					Gender = 'M',
					Nif = "123456798",
					UserType = 'M',
					PhoneNumber = null,
					PhoneNumberConfirmed = false,
					IsSuspended = false,
					IsBlocked = false,
					ProfilePicPath = null,
					TwoFactorEnabled = false,
					LockoutEnabled = false,
					AccessFailedCount = 0,
					UserName = "123456798_" + DateTime.Now.Millisecond,
					BirthDate = new DateTime(1990, 1, 1),
				};
				await _userManager.CreateAsync(manager, "Pass1234");
				await _userManager.AddToRoleAsync(manager, SD.ManagerRole);
				await _userManager.AddClaimsAsync(manager,
				[
					new Claim(ClaimTypes.NameIdentifier, manager.Id),
					new Claim(ClaimTypes.Email, manager.Email),
					new Claim(ClaimTypes.Name, manager.FirstName + " " + manager.LastName)
				]);

				var random = new Random();
				var users = new List<User>();

				for (int i = 1; i <= 15; i++)
				{

					var patientUser = new User
					{
						Id = i.ToString(),
						FirstName = $"User{i}",
						LastName = "Family",
						Email = $"user{i}@mail.com",
						NormalizedEmail = $"user{i}@mail.com",
						Gender = i % 2 == 0 ? 'M' : 'F',
						Nif = (12345678 + i).ToString(),
						UserType = 'U',
						PhoneNumber = null,
						PhoneNumberConfirmed = false,
						EmailConfirmed = true,
						IsSuspended = false,
						IsBlocked = false,
						ProfilePicPath = null,
						TwoFactorEnabled = false,
						LockoutEnabled = false,
						AccessFailedCount = 0,
						UserName = ("12345678" + i) + '_' + DateTime.Now.Millisecond,
						BirthDate = DateTime.Now.AddYears(-18 - random.Next(1, 15)),
					};
					users.Add(patientUser);
				}


				for (int i = 16; i <= 71; i++)
				{

					var professionalUser = new User
					{
						Id = i.ToString(),
						FirstName = $"Professional{i}",
						LastName = "User",
						Email = $"professional{i}@mail.com",
						NormalizedEmail = $"professional{i}@mail.com",
						Gender = i % 2 == 0 ? 'M' : 'F',
						Nif = (12345678 + i).ToString(),
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
						UserName = ("12345678" + i) + '_' + DateTime.Now.Millisecond,
						BirthDate = DateTime.Now.AddYears(-18 - random.Next(1, 15)),
					};
					users.Add(professionalUser);
				}




				List<Professional> usersProfessionals = new List<Professional>();
				List<Patient> usersPatients = new List<Patient>();
				List<Service> services = new List<Service>();

				int counter = 1;

				foreach (var user in users)
				{
					await _userManager.CreateAsync(user, "Pass1234");
					if (user.UserType == 'U')
					{
						var patientToAdd = new Patient
						{
							UserID = user.Id
						};

						await _context.Patients.AddAsync(patientToAdd);
						await _userManager.AddToRoleAsync(user, SD.PatientRole);
						usersPatients.Add(patientToAdd);

						var relative1 = new Relative { IdPatient = patientToAdd.UserID, Name = "Mário Granaci", Gender = 'M', BirthDate = new DateTime(2003, 4, 29) };
						var relative2 = new Relative { IdPatient = patientToAdd.UserID, Name = "Jaime Vieira", Gender = 'F', BirthDate = new DateTime(2002, 9, 24) };
						var relative3 = new Relative { IdPatient = patientToAdd.UserID, Name = "Marta Silva", Gender = 'F', BirthDate = new DateTime(1998, 12, 15) };

						if (user.Id == "4" || user.Id == "7" || user.Id == "12")
							await _context.Relatives.AddRangeAsync(relative1, relative2, relative3);


					}
					else
					{
						var professionalToAdd = new Professional
						{
							UserID = user.Id,
							ProfessionalTypeId = counter++,
							Location = null,
							Services = new List<Service>(),
							Reviews = new List<Review>(),
						};
						if (counter >= 9) counter = 1;

						await _userManager.AddToRoleAsync(user, SD.ProfessionalRole);
						usersProfessionals.Add(professionalToAdd);


					}
					await _userManager.AddClaimsAsync(user,
						[
							new Claim(ClaimTypes.NameIdentifier, user.Id),
										new Claim(ClaimTypes.Email, user.Email),
										new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName)
						]);
				}


				int counterProfessionals = 1;

				int counterLocations = 1;

				//Adicionar serviços a 5 profisssionais por tipo
				foreach (var professional in usersProfessionals)
				{


					if (counterProfessionals > 7)
					{
						counterProfessionals = 1;
					}



					if (counterProfessionals <= 5)
					{
						switch (professional.ProfessionalTypeId)
						{
							case 1:
								int rnd1 = random.Next(1, 50);
								Service service1 = new Service { IdProfessional = professional.UserID, IdSpecialty = rnd1, PricePerHour = random.Next(10, 25), Online = true, Presential = false, Home = true };
								professional.Services.Add(service1);
								break;

							case 2:
								int rnd2 = random.Next(51, 71);
								Service service2 = new Service { IdProfessional = professional.UserID, IdSpecialty = rnd2, PricePerHour = random.Next(15, 25), Online = false, Presential = true, Home = true };
								professional.Services.Add(service2);
								break;

							case 3:
								int rnd3 = random.Next(101, 113);
								Service service3 = new Service { IdProfessional = professional.UserID, IdSpecialty = rnd3, PricePerHour = random.Next(13, 28), Online = true, Presential = true, Home = false };
								professional.Services.Add(service3);
								break;

							case 4:
								int rnd4 = random.Next(114, 132);
								Service service4 = new Service { IdProfessional = professional.UserID, IdSpecialty = rnd4, PricePerHour = random.Next(11, 30), Online = true, Presential = true, Home = true };
								professional.Services.Add(service4);
								break;

							case 5:
								Service service5 = new Service { IdProfessional = professional.UserID, IdSpecialty = random.Next(133, 144), PricePerHour = random.Next(9, 33), Online = false, Presential = false, Home = true };
								professional.Services.Add(service5);
								break;

							case 6:
								Service service6 = new Service { IdProfessional = professional.UserID, IdSpecialty = random.Next(145, 171), PricePerHour = random.Next(14, 25), Online = false, Presential = true, Home = true };
								professional.Services.Add(service6);
								break;

							case 7:
								Service service7 = new Service { IdProfessional = professional.UserID, IdSpecialty = random.Next(172, 179), PricePerHour = random.Next(10, 20), Online = true, Presential = false, Home = true };
								professional.Services.Add(service7);
								break;

							case 8:
								Service service8 = new Service { IdProfessional = professional.UserID, IdSpecialty = random.Next(180, 198), PricePerHour = random.Next(13, 27), Online = true, Presential = false, Home = true };
								professional.Services.Add(service8);
								break;

							default:
								break;
						}

					}




					double portugalLatitude = 39.3999;
					double portugalLongitude = -8.2245;
					double radius = 1.0;


					double latOffset = (random.NextDouble() * 2 - 1) * radius;
					double lonOffset = (random.NextDouble() * 2 - 1) * radius;

					double newLatitude = portugalLatitude + latOffset;
					double newLongitude = portugalLongitude + lonOffset;


					if (counterLocations <= 15)
					{
						professional.Location = $"{newLatitude};{newLongitude}";
					}


					counterLocations++;
					counterProfessionals++;

				}



				//10 reports , 3 para o mesmo profissional
				Report report1 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[0].UserID, IdProfesional = usersProfessionals[0].UserID, Description = "Não apareceu a consulta e fiquei sem o dinheiro.", State = ReportState.Pending };
				Report report2 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[1].UserID, IdProfesional = usersProfessionals[0].UserID, Description = "O profissional não compareceu.", State = ReportState.Pending };
				Report report3 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[2].UserID, IdProfesional = usersProfessionals[0].UserID, Description = "Médico falso.", State = ReportState.Pending };
				Report report4 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[3].UserID, IdProfesional = usersProfessionals[1].UserID, Description = "Médico falso.", State = ReportState.Pending };
				Report report5 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[4].UserID, IdProfesional = usersProfessionals[2].UserID, Description = "O profissional não compareceu.", State = ReportState.Pending };
				Report report6 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[5].UserID, IdProfesional = usersProfessionals[3].UserID, Description = "Não apareceu a consulta e fiquei sem o dinheiro.", State = ReportState.Pending };
				Report report7 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[6].UserID, IdProfesional = usersProfessionals[4].UserID, Description = "O profissional não compareceu.", State = ReportState.Pending };
				Report report8 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[7].UserID, IdProfesional = usersProfessionals[5].UserID, Description = "Médico falso.", State = ReportState.Pending };
				Report report9 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[8].UserID, IdProfesional = usersProfessionals[6].UserID, Description = "Não apareceu a consulta e fiquei sem o dinheiro. ", State = ReportState.Pending };
				Report report10 = new Report { Timestamp = DateTime.Now, IdPatient = usersPatients[9].UserID, IdProfesional = usersProfessionals[7].UserID, Description = "O profissional não compareceu.", State = ReportState.Pending };

				await _context.Professionals.AddRangeAsync(usersProfessionals);
				await _context.Report.AddRangeAsync(report1, report2, report3, report4, report5, report6, report7, report8, report9, report10);
				await _context.SaveChangesAsync();


				var infoService = await _context.Services
					.Include(s => s.Specialty)
					.ThenInclude(o => o.ProfessionalType)
					.Include(p => p.Professional)
					.ThenInclude(u => u.User)
					.ToListAsync();

				//3 Reviews para todos os profissionais
				List<AvailableSlot> availableSlots = new List<AvailableSlot>();
				List<Review> reviews = new List<Review>();
				List<Appointment> appointments = new List<Appointment>();
				foreach (var service in infoService)
				{
					Review review1 = new Review { IdPatient = random.Next(1, 16).ToString(), IdService = service.Id, State = ReviewState.Normal, Timestamp = DateTime.Now , Stars = random.Next(1, 5), Description = "Serviço Bom!" };
					Review review2 = new Review { IdPatient = random.Next(1, 16).ToString(), IdService = service.Id, State = ReviewState.Normal, Timestamp = DateTime.Now, Stars = random.Next(1, 5), Description = "Cumpriu." };
					Review review3 = new Review { IdPatient = random.Next(1, 16).ToString(), IdService = service.Id, State = ReviewState.Normal, Timestamp = DateTime.Now, Stars = random.Next(1, 5), Description = "Ladrão..." };
					reviews.AddRange(new List<Review> { review1, review2, review3 });

					DateTime dataAtual = DateTime.Now;

					int diasAleatorios = random.Next(0, 366);

					int diasAleatoriosFuturos = random.Next(150, 366);

					for (int i = 0; i < 5; i++)
                    {
                        AvailableSlot slot = new AvailableSlot { IdService = service.Id, Start = new DateTime(2024, 5, 15, 9, i * 10, 0), SlotDuration = 10, AppointmentType = AppointmentType.Presential, IsAvailable = true };
                        availableSlots.Add(slot);
                    }
                    for (int i = 0; i < 5; i++)
                    {
                        AvailableSlot slot = new AvailableSlot { IdService = service.Id, Start = new DateTime(2024, 5, 15, 10, i * 10, 0), SlotDuration = 10, AppointmentType = AppointmentType.Online, IsAvailable = true };
                        availableSlots.Add(slot);
                    }
                    for (int i = 0; i < 5; i++)
                    {
                        AvailableSlot slot = new AvailableSlot { IdService = service.Id, Start = new DateTime(2024, 5, 15, 11 + i, 0, 0), SlotDuration = 10, AppointmentType = AppointmentType.Home, IsAvailable = true };
                        availableSlots.Add(slot);
                    }

					Appointment appointment1 = new Appointment
					{
						Timestamp = DateTime.Now,
						Type = AppointmentType.Online,
						State = AppointmentState.Scheduled,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment4 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Online,
						State = AppointmentState.Scheduled,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};
					Appointment appointment5 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Online,
						State = AppointmentState.Scheduled,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment6 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Online,
						State = AppointmentState.Scheduled,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment7 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Online,
						State = AppointmentState.Scheduled,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment2 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Presential,
						State = AppointmentState.Pending,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment8 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Presential,
						State = AppointmentState.Pending,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment12 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Presential,
						State = AppointmentState.Pending,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment13 = new Appointment
					{
						Timestamp = dataAtual.AddDays(diasAleatoriosFuturos),
						Type = AppointmentType.Presential,
						State = AppointmentState.Pending,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment3 = new Appointment
					{
						Timestamp = dataAtual.AddDays(-diasAleatorios),
						Type = AppointmentType.Home,
						State = AppointmentState.Done,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment9 = new Appointment
					{
						Timestamp = dataAtual.AddDays(-diasAleatorios),
						Type = AppointmentType.Home,
						State = AppointmentState.Done,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment10 = new Appointment
					{
						Timestamp = dataAtual.AddDays(-diasAleatorios),
						Type = AppointmentType.Home,
						State = AppointmentState.Done,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					Appointment appointment11 = new Appointment
					{
						Timestamp = dataAtual.AddDays(-diasAleatorios),
						Type = AppointmentType.Home,
						State = AppointmentState.Done,
						Duration = random.Next(1, 3),
						IdProfesional = service.IdProfessional,
						IdPatient = random.Next(1, 16).ToString(),
						IdService = service.Id
					};

					appointments.AddRange(new List<Appointment> { appointment1, appointment2 , appointment3, appointment4 , appointment5 , appointment6 ,
						appointment7, appointment8 , appointment9, appointment10, appointment11, appointment12, appointment13 });

				}


				await _context.AvailableSlots.AddRangeAsync(availableSlots);

				await _context.Reviews.AddRangeAsync(reviews);
				await _context.Appointment.AddRangeAsync(appointments);
				await _context.SaveChangesAsync();
			}
		}
	}
}
