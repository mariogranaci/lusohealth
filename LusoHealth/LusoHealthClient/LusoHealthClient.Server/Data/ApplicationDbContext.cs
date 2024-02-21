using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public DbSet<User> Users { get; set; }
        public DbSet<ProfessionalType> ProfessionalTypes { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProfessionalType>().HasData(
                new ProfessionalType { Id = 1, Name = "Medicina" },
                new ProfessionalType { Id = 2, Name = "Enfermagem" },
                new ProfessionalType { Id = 3, Name = "Medicina Dentária" },
                new ProfessionalType { Id = 4, Name = "Fisioterapia" },
                new ProfessionalType { Id = 5, Name = "Nutricionismo" },
                new ProfessionalType { Id = 6, Name = "Psicologia" },
                new ProfessionalType { Id = 7, Name = "Fisiologia" },
                new ProfessionalType { Id = 8, Name = "Outros" }
            );
        }
    }
}
