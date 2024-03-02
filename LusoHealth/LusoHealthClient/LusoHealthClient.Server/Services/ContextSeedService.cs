using LusoHealthClient.Server.Data;
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

                var user1 = new User
                {
                    Id = "1",
                    FirstName = "User1",
                    LastName = "Family",
                    Email = "user1@mail.com",
                    NormalizedEmail = "user1@mail.com",
                    Gender = 'M',
                    Nif = "123456789",
                    UserType = 'U',
                    PhoneNumber = "987654321",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "123456789" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1990, 1, 1)
                };
                var user2 = new User
                {
                    Id = "2",
                    FirstName = "User2",
                    LastName = "Family",
                    Email = "user2@mail.com",
                    NormalizedEmail = "user2@mail.com",
                    Gender = 'F',
                    Nif = "987654321",
                    UserType = 'U',
                    PhoneNumber = "123456789",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "987654321" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1995, 5, 15)
                };
                var user3 = new User
                {
                    Id = "3",
                    FirstName = "User3",
                    LastName = "Family",
                    Email = "user3@mail.com",
                    NormalizedEmail = "user3@mail.com",
                    Gender = 'M',
                    Nif = "111223344",
                    UserType = 'U',
                    PhoneNumber = "555555555",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "111223344" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1988, 8, 8)
                };
                var user4 = new User
                {
                    Id = "4",
                    FirstName = "User4",
                    LastName = "Family",
                    Email = "user4@mail.com",
                    NormalizedEmail = "user4@mail.com",
                    Gender = 'F',
                    Nif = "999888777",
                    UserType = 'U',
                    PhoneNumber = "444444444",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "999888777" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1992, 12, 25)
                };
                var user5 = new User
                {
                    Id = "5",
                    FirstName = "User5",
                    LastName = "Family",
                    Email = "user5@mail.com",
                    NormalizedEmail = "user5@mail.com",
                    Gender = 'M',
                    Nif = "555444333",
                    UserType = 'P',
                    PhoneNumber = "333333333",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "333333333" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1997, 7, 7)
                };
                var user6 = new User
                {
                    Id = "6",
                    FirstName = "User6",
                    LastName = "Family",
                    Email = "user6@mail.com",
                    NormalizedEmail = "user6@mail.com",
                    Gender = 'F',
                    Nif = "777666555",
                    UserType = 'P',
                    PhoneNumber = "222222222",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = null,
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "777666555" + '_' + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1994, 4, 14)
                };
                var userGoogle = new User
                {
                    Id = "7",
                    FirstName = "User",
                    LastName = "Google",
                    Email = "usergoogle@mail.com",
                    NormalizedEmail = "usergoogle@mail.com",
                    Gender = 'M',
                    Nif = "123215648",
                    UserType = 'P',
                    PhoneNumber = "231564789",
                    PhoneNumberConfirmed = false,
                    EmailConfirmed = true,
                    IsSuspended = false,
                    IsBlocked = false,
                    ProfilePicPath = "https://img.freepik.com/fotos-premium/empreendedor-deprimido-triste-em-homem-de-trabalhador-de-terno-formal-sentado-perto-de-uma-rua-ao-ar-livre-perto-do-centro-de-negocios-de-escritorio-moderno-homem-de-negocios-chateado-perdeu-o-emprego-devido-a-um-funcionario-de-crise-financeira-tem-problema-lado-de-fora_321831-6752.jpg",
                    TwoFactorEnabled = false,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    UserName = "123215648_" + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1994, 4, 14),
                    Provider = "google",

                };
                var user8 = new User
                {
                    Id = "8",
                    FirstName = "User6",
                    LastName = "Family",
                    Email = "user8@mail.com",
                    NormalizedEmail = "user8@mail.com",
                    Gender = 'F',
                    Nif = "151513165",
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
                    UserName = "123456798_" + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1990, 1, 1),
                };
                var user9 = new User
                {
                    Id = "9",
                    FirstName = "Professional",
                    LastName = "User",
                    Email = "user9@mail.com",
                    NormalizedEmail = "user9@mail.com",
                    Gender = 'M',
                    Nif = "159765432",
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
                    UserName = "159765432" + DateTime.Now.Millisecond,
                    BirthDate = new DateTime(1990, 1, 1),
                };

                var users = new List<User> { user1, user2, user3, user4, user5, user6, userGoogle, user8, user9};

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

                        var relative1 = new Relative { IdPatient = patientToAdd.UserID, Name = "Mário Granaci", Gender = 'M', BirthDate = new DateTime(2003, 4, 29) };
                        var relative2 = new Relative { IdPatient = patientToAdd.UserID, Name = "Jaime Vieira", Gender = 'F', BirthDate = new DateTime(2002, 9, 24) };
                        var relative3 = new Relative { IdPatient = patientToAdd.UserID, Name = "Marta Silva", Gender= 'F', BirthDate = new DateTime(1998, 12, 15) };
                        var relative4 = new Relative { IdPatient = patientToAdd.UserID, Name = "Miguel Silva", Gender = 'M', BirthDate = new DateTime(1996, 5, 5) };
                        await _context.Relatives.AddRangeAsync(relative1, relative2, relative3, relative4);
                    }
                    else
                    {
                        double lisbonLatitude = 38.7074;
                        double lisbonLongitude = -9.1368;
                        double radius = 0.1;

                        var random = new Random();
                        double latOffset = (random.NextDouble() * 2 - 1) * radius;
                        double lonOffset = (random.NextDouble() * 2 - 1) * radius;

                        double newLatitude = lisbonLatitude + latOffset;
                        double newLongitude = lisbonLongitude + lonOffset;

                        var professionalToAdd = new Professional
                        {
                            UserID = user.Id,
                            ProfessionalTypeId = 1,
                            Location = $"{newLatitude};{newLongitude}"
                        };
                        await _context.Professionals.AddAsync(professionalToAdd);
                        await _userManager.AddToRoleAsync(user, SD.ProfessionalRole);
                    }
                    await _userManager.AddClaimsAsync(user,
                        [
                            new Claim(ClaimTypes.NameIdentifier, user.Id),
                            new Claim(ClaimTypes.Email, user.Email),
                            new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName)
                        ]);
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}
