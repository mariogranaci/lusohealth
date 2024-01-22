using LusoHealthClient.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LusoHealthClient.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public DbSet<User> Users { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Create two predefined users
            var userManager = new UserManager<User>(new UserStore<User>(this), null, null, null, null, null, null, null, null);

            // User 1
            var user1 = new User
            {
                Name = "User One",
                Gender = 'M',
                Nif = "123456789",
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = null,
                UserType = 'U',

                Email = "user@gmail.com",
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                EmailConfirmed = true,
                PhoneNumber = "123456789",
                PhoneNumberConfirmed = false,
            };

            userManager.CreateAsync(user1, "YourPassword").GetAwaiter().GetResult();

            // User 2
            var user2 = new User
            {
                Name = "User Two",
                Gender = 'F',
                Nif = "987654321",
                IsSuspended = false,
                IsBlocked = false,
                ProfilePicPath = null,
                UserType = 'P',

                Email = "prof@gmail.com",
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                EmailConfirmed = true,
                PhoneNumber = "987654321",
                PhoneNumberConfirmed = false,
            };

            userManager.CreateAsync(user2, "YourPassword").GetAwaiter().GetResult();

            modelBuilder.Entity<User>().HasData(
            user1,
            user2
        );
        }
    }
}
