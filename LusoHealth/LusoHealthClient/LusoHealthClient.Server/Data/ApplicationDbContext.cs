using LusoHealthClient.Server.Models.Appointments;
using LusoHealthClient.Server.Models.Chat;
using LusoHealthClient.Server.Models.FeedbackAndReports;
using LusoHealthClient.Server.Models.Professionals;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LusoHealthClient.Server.Data
{
	/// <summary>
	/// Classe que representa o contexto do banco de dados da aplicação.
	/// Herda de IdentityDbContext para fornecer funcionalidades de autenticação.
	/// </summary>
	public class ApplicationDbContext : IdentityDbContext<User>
	{
		public new DbSet<User> Users { get; set; }
		public DbSet<ProfessionalType> ProfessionalTypes { get; set; }
		public DbSet<Specialty> Specialties { get; set; }
		public DbSet<Patient> Patients { get; set; }
		public DbSet<Professional> Professionals { get; set; }
		public DbSet<Review> Reviews { get; set; }
		public DbSet<Service> Services { get; set; }
		public DbSet<Report> Report { get; set; }
		public DbSet<Appointment> Appointment { get; set; }
		public DbSet<Relative> Relatives { get; set; }
		public DbSet<Certificate> Certificates { get; set; }
		public DbSet<AvailableSlot> AvailableSlots { get; set; }
		public DbSet<Address> Addresses { get; set; }
		public DbSet<Chat> Chat { get; set; }
		public DbSet<Message> Message { get; set; }
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
		{
		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.Entity<Relative>()
				.HasOne(r => r.Patient)
				.WithMany(p => p.FamilyAggregate)
				.HasForeignKey(r => r.IdPatient);

			// Configure User entity
			modelBuilder.Entity<User>()
				.Property(u => u.Gender)
				.IsRequired();

			modelBuilder.Entity<User>()
				.Property(u => u.Nif)
				.IsRequired();

			modelBuilder.Entity<User>()
				.Property(u => u.UserType)
				.IsRequired();

			//// Configure Review entity
			//modelBuilder.Entity<Review>()
			//    .HasKey(r => new { r.IdPatient, r.IdService });

			// Configure Service entity
			modelBuilder.Entity<Service>()
				.HasOne(s => s.Professional)
				.WithMany(p => p.Services)
				.HasForeignKey(s => s.IdProfessional)
				.OnDelete(DeleteBehavior.NoAction);

			modelBuilder.Entity<Service>()
				.HasOne(s => s.Specialty)
				.WithMany()
				.HasForeignKey(s => s.IdSpecialty)
				.OnDelete(DeleteBehavior.NoAction);

			// Configure Certificate entity
			modelBuilder.Entity<Certificate>()
				.HasOne(c => c.Professional)
				.WithMany(p => p.Certificates)
				.HasForeignKey(c => c.IdProfessional);

			modelBuilder.Entity<ProfessionalType>().HasData(
				new ProfessionalType { Id = 1, Name = "Médico" },
				new ProfessionalType { Id = 2, Name = "Enfermeiro" },
				new ProfessionalType { Id = 3, Name = "Dentista" },
				new ProfessionalType { Id = 4, Name = "Fisioterapeuta" },
				new ProfessionalType { Id = 5, Name = "Nutricionista" },
				new ProfessionalType { Id = 6, Name = "Psicologista" },
				new ProfessionalType { Id = 7, Name = "Fisiologista" },
				new ProfessionalType { Id = 8, Name = "Outro" }
			);

			modelBuilder.Entity<Specialty>().HasData(
				// Medicina
				new Specialty { Id = 1, Name = "Anatomia Patológica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 2, Name = "Anestesiologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 3, Name = "Cardiologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 4, Name = "Cardiologia Pediátrica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 5, Name = "Cirurgia Cardíaca", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 6, Name = "Cirurgia Geral", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 7, Name = "Cirurgia Maxilofacial", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 8, Name = "Cirurgia Pediátrica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 9, Name = "Cirurgia Plástica, Reconstrutiva e Estética", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 10, Name = "Cirurgia Torácica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 11, Name = "Cirurgia Vascular", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 12, Name = "Clínica Geral", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 13, Name = "Cuidados Paliativos", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 14, Name = "Dermatologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 15, Name = "Endocrinologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 16, Name = "Estomatologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 17, Name = "Farmacologia Clínica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 18, Name = "Gastrenterologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 19, Name = "Gastrenterologia Pediátrica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 20, Name = "Genética Médica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 21, Name = "Ginecologia-Obstetrícia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 22, Name = "Hematologia Clínica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 23, Name = "Imagiologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 24, Name = "Imunoalergologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 25, Name = "Imunohemoterapia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 26, Name = "Infecciologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 27, Name = "Medicina Capilar", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 28, Name = "Medicina de Trabalho", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 29, Name = "Medicina Desportiva", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 30, Name = "Medicina Estética", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 31, Name = "Medicina Física e de Reabilitação", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 32, Name = "Medicina Geral e Familiar", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 33, Name = "Medicina Intensiva", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 34, Name = "Medicina Interna", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 35, Name = "Medicina Nuclear", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 36, Name = "Nefrologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 37, Name = "Nefrologia Pediátrica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 38, Name = "Neonatologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 39, Name = "Neurocirurgia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 40, Name = "Neurologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 41, Name = "Neuropediatria", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 42, Name = "Neurorradiologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 43, Name = "Oftalmologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 44, Name = "Oncologia Médica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 45, Name = "Ortopedia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 46, Name = "Otorrinolaringologia", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 47, Name = "Patologia Clínica", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 48, Name = "Pediatria", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 49, Name = "Pediatria do Desenvolvimento", ProfessionalTypeId = 1, TimesScheduled = 0 },
				new Specialty { Id = 50, Name = "Pneumologia", ProfessionalTypeId = 1, TimesScheduled = 0 },

				// Enfermagem
				new Specialty { Id = 51, Name = "Sem Especialidade", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 52, Name = "Médico-Cirúrgica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 53, Name = "Pediatria", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 54, Name = "Obstétrica e Ginecológica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 55, Name = "Saúde Mental", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 56, Name = "Geriátrica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 57, Name = "Comunitária", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 58, Name = "Oncológica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 59, Name = "Cuidados Paliativos", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 60, Name = "Reabilitação", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 61, Name = "Cardiovascular", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 62, Name = "Nefrológica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 63, Name = "Dermatológica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 64, Name = "Saúde da Mulher", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 65, Name = "Cirurgia Plástica", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 66, Name = "Saúde do Trabalhador", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 67, Name = "Neonatal", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 68, Name = "Saúde da Família", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 69, Name = "Transplantes", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 70, Name = "Diabetes", ProfessionalTypeId = 2, TimesScheduled = 0 },
				new Specialty { Id = 71, Name = "Cuidados Continuados", ProfessionalTypeId = 2, TimesScheduled = 0 },

				// Medicina Dentária
				new Specialty { Id = 101, Name = "Sem Especialidade", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 102, Name = "Ortodontia", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 103, Name = "Periodontia", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 104, Name = "Endodontia", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 105, Name = "Cirurgia Oral e Maxilofacial", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 106, Name = "Odontopediatria", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 107, Name = "Dentística Restauradora", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 108, Name = "Implantologia", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 109, Name = "Ortopedia Funcional dos Maxilares", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 110, Name = "Medicina Oral", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 111, Name = "Patologia Oral", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 112, Name = "Radiologia Odontológica", ProfessionalTypeId = 3, TimesScheduled = 0 },
				new Specialty { Id = 113, Name = "Odontologia do Trabalho", ProfessionalTypeId = 3, TimesScheduled = 0 },

				// Fisioterapia
				new Specialty { Id = 114, Name = "Sem Especialidade", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 115, Name = "Desportiva", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 116, Name = "Neurológica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 117, Name = "Ortopédica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 118, Name = "Respiratória", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 119, Name = "Pediatria", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 120, Name = "Geriátrica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 121, Name = "Cardiovascular", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 122, Name = "Aquática", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 123, Name = "Feminina", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 124, Name = "Trabalho", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 125, Name = "Oncológica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 126, Name = "Reumatológica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 127, Name = "Intensiva", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 128, Name = "Vestibular", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 129, Name = "Traumato-Ortopédica", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 130, Name = "Manual", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 131, Name = "Dermatofuncional", ProfessionalTypeId = 4, TimesScheduled = 0 },
				new Specialty { Id = 132, Name = "Terapia Intensiva Neonatal", ProfessionalTypeId = 4, TimesScheduled = 0 },

				// Nutricionismo
				new Specialty { Id = 133, Name = "Sem Especialidade", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 134, Name = "Clínica", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 135, Name = "Esportiva", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 136, Name = "Materno-Infantil", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 137, Name = "Funcional", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 138, Name = "Estética", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 139, Name = "Geriátrica", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 140, Name = "Oncológica", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 141, Name = "Comportamental", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 142, Name = "Escolar", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 143, Name = "Enteral e Parenteral", ProfessionalTypeId = 5, TimesScheduled = 0 },
				new Specialty { Id = 144, Name = "Saúde Pública", ProfessionalTypeId = 5, TimesScheduled = 0 },

				// Psicologia
				new Specialty { Id = 145, Name = "Sem Especialidade", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 146, Name = "Clínica", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 147, Name = "Educacional", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 148, Name = "Organizacional e do Trabalho", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 149, Name = "Social", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 150, Name = "Desportiva", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 151, Name = "Saúde", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 152, Name = "Forense", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 153, Name = "Desenvolvimento", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 154, Name = "Cognitiva", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 155, Name = "Neuropsicologia", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 156, Name = "Positiva", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 157, Name = "Ambiental", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 158, Name = "Transpessoal", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 159, Name = "Familiar", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 160, Name = "Tráfego", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 161, Name = "Personalidade", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 162, Name = "Existencial", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 163, Name = "Consumidor", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 164, Name = "Envelhecimento", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 165, Name = "Escolar", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 166, Name = "Trabalho e Carreira", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 167, Name = "Aprendizagem", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 168, Name = "Cultural", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 169, Name = "Espectro Autista", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 170, Name = "Trauma", ProfessionalTypeId = 6, TimesScheduled = 0 },
				new Specialty { Id = 171, Name = "Sexualidade", ProfessionalTypeId = 6, TimesScheduled = 0 },

				// Fisiologia
				new Specialty { Id = 172, Name = "Desportiva", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 173, Name = "Cardiovascular", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 174, Name = "Respiratória", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 175, Name = "Renal", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 176, Name = "Endócrina", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 177, Name = "Neurofisiologia", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 178, Name = "Reprodutiva", ProfessionalTypeId = 7, TimesScheduled = 0 },
				new Specialty { Id = 179, Name = "Sistema Digestivo", ProfessionalTypeId = 7, TimesScheduled = 0 },

				// Outros
				new Specialty { Id = 180, Name = "Terapia Ocupacional", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 181, Name = "Quiropraxia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 182, Name = "Acupuntura", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 183, Name = "Podologia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 184, Name = "Osteopatia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 185, Name = "Musicoterapia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 186, Name = "Arteterapia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 187, Name = "Terapia Comportamental", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 188, Name = "Terapia Holística", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 189, Name = "Terapia Familiar", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 190, Name = "Terapia de Casal", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 191, Name = "Terapia de Grupo", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 192, Name = "Terapia Cognitivo-Comportamental (TCC)", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 193, Name = "Naturopatia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 194, Name = "Homeopatia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 195, Name = "Hipnoterapia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 196, Name = "Reflexologia", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 197, Name = "Shiatsu", ProfessionalTypeId = 8, TimesScheduled = 0 },
				new Specialty { Id = 198, Name = "Massoterapia", ProfessionalTypeId = 8, TimesScheduled = 0 }
		);
		}
	}
}
