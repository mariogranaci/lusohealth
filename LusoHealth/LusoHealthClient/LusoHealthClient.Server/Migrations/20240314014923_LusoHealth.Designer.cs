﻿// <auto-generated />
using System;
using LusoHealthClient.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace LusoHealthClient.Server.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20240314014923_LusoHealth")]
    partial class LusoHealth
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("LusoHealthClient.Server.Models.Appointments.AvailableSlot", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("AppointmentType")
                        .HasColumnType("int");

                    b.Property<int>("IdService")
                        .HasColumnType("int");

                    b.Property<bool>("IsAvailable")
                        .HasColumnType("bit");

                    b.Property<int>("SlotDuation")
                        .HasColumnType("int");

                    b.Property<DateTime>("Start")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("AvailableSlots");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.FeedbackAndReports.Report", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("IdPatient")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("IdProfesional")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("State")
                        .HasColumnType("int");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("Report");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.FeedbackAndReports.Review", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("IdPatient")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("IdService")
                        .HasColumnType("int");

                    b.Property<string>("ProfessionalUserID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("Stars")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("IdPatient");

                    b.HasIndex("IdService");

                    b.HasIndex("ProfessionalUserID");

                    b.ToTable("Reviews");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Certificate", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("IdProfessional")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("IdProfessional");

                    b.ToTable("Certificates");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.ProfessionalType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("ProfessionalTypes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Name = "Médico"
                        },
                        new
                        {
                            Id = 2,
                            Name = "Enfermeiro"
                        },
                        new
                        {
                            Id = 3,
                            Name = "Dentista"
                        },
                        new
                        {
                            Id = 4,
                            Name = "Fisioterapeuta"
                        },
                        new
                        {
                            Id = 5,
                            Name = "Nutricionista"
                        },
                        new
                        {
                            Id = 6,
                            Name = "Psicologista"
                        },
                        new
                        {
                            Id = 7,
                            Name = "Fisiologista"
                        },
                        new
                        {
                            Id = 8,
                            Name = "Outro"
                        });
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Service", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Home")
                        .HasColumnType("bit");

                    b.Property<string>("IdProfessional")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("IdSpecialty")
                        .HasColumnType("int");

                    b.Property<bool>("Online")
                        .HasColumnType("bit");

                    b.Property<bool>("Presential")
                        .HasColumnType("bit");

                    b.Property<double>("PricePerHour")
                        .HasColumnType("float");

                    b.HasKey("Id");

                    b.HasIndex("IdProfessional");

                    b.HasIndex("IdSpecialty");

                    b.ToTable("Services");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Specialty", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ProfessionalTypeId")
                        .HasColumnType("int");

                    b.Property<int>("TimesScheduled")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ProfessionalTypeId");

                    b.ToTable("Specialties");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Name = "Anatomia Patológica",
                            ProfessionalTypeId = 1,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 51,
                            Name = "Sem Especialidade",
                            ProfessionalTypeId = 2,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 101,
                            Name = "Sem Especialidade",
                            ProfessionalTypeId = 3,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 114,
                            Name = "Sem Especialidade",
                            ProfessionalTypeId = 4,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 133,
                            Name = "Sem Especialidade",
                            ProfessionalTypeId = 5,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 145,
                            Name = "Sem Especialidade",
                            ProfessionalTypeId = 6,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 172,
                            Name = "Desportiva",
                            ProfessionalTypeId = 7,
                            TimesScheduled = 0
                        },
                        new
                        {
                            Id = 180,
                            Name = "Terapia Ocupacional",
                            ProfessionalTypeId = 8,
                            TimesScheduled = 0
                        });
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Services.Appointment", b =>
                {
                    b.Property<int?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int?>("Id"));

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("Duration")
                        .HasColumnType("int");

                    b.Property<string>("IdPatient")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("IdProfesional")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int?>("IdService")
                        .HasColumnType("int");

                    b.Property<string>("Location")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PaymentIntentId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("State")
                        .HasColumnType("int");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime2");

                    b.Property<int?>("Type")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("IdPatient");

                    b.HasIndex("IdProfesional");

                    b.HasIndex("IdService");

                    b.ToTable("Appointment");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Patient", b =>
                {
                    b.Property<string>("UserID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Agenda")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserID");

                    b.ToTable("Patients");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Professional", b =>
                {
                    b.Property<string>("UserID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Agenda")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Location")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ProfessionalTypeId")
                        .HasColumnType("int");

                    b.HasKey("UserID");

                    b.HasIndex("ProfessionalTypeId");

                    b.ToTable("Professionals");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Relative", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("BirthDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Gender")
                        .IsRequired()
                        .HasColumnType("nvarchar(1)");

                    b.Property<string>("IdPatient")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Location")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Nif")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("IdPatient");

                    b.ToTable("Relatives");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<DateTime>("BirthDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Gender")
                        .IsRequired()
                        .HasColumnType("nvarchar(1)");

                    b.Property<bool>("IsBlocked")
                        .HasColumnType("bit");

                    b.Property<bool>("IsSuspended")
                        .HasColumnType("bit");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Nif")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("ProfilePicPath")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Provider")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("UserType")
                        .IsRequired()
                        .HasColumnType("nvarchar(1)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.FeedbackAndReports.Review", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.Patient", "Patient")
                        .WithMany()
                        .HasForeignKey("IdPatient")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("LusoHealthClient.Server.Models.Professionals.Service", "Service")
                        .WithMany()
                        .HasForeignKey("IdService")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("LusoHealthClient.Server.Models.Users.Professional", null)
                        .WithMany("Reviews")
                        .HasForeignKey("ProfessionalUserID");

                    b.Navigation("Patient");

                    b.Navigation("Service");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Certificate", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.Professional", "Professional")
                        .WithMany("Certificates")
                        .HasForeignKey("IdProfessional")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Professional");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Service", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.Professional", "Professional")
                        .WithMany("Services")
                        .HasForeignKey("IdProfessional")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("LusoHealthClient.Server.Models.Professionals.Specialty", "Specialty")
                        .WithMany()
                        .HasForeignKey("IdSpecialty")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Professional");

                    b.Navigation("Specialty");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Professionals.Specialty", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Professionals.ProfessionalType", "ProfessionalType")
                        .WithMany()
                        .HasForeignKey("ProfessionalTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ProfessionalType");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Services.Appointment", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.Patient", "Patient")
                        .WithMany()
                        .HasForeignKey("IdPatient");

                    b.HasOne("LusoHealthClient.Server.Models.Users.Professional", "Professional")
                        .WithMany()
                        .HasForeignKey("IdProfesional");

                    b.HasOne("LusoHealthClient.Server.Models.Professionals.Service", "Service")
                        .WithMany()
                        .HasForeignKey("IdService");

                    b.Navigation("Patient");

                    b.Navigation("Professional");

                    b.Navigation("Service");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Patient", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.User", "User")
                        .WithMany()
                        .HasForeignKey("UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Professional", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Professionals.ProfessionalType", "ProfessionalType")
                        .WithMany()
                        .HasForeignKey("ProfessionalTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("LusoHealthClient.Server.Models.Users.User", "User")
                        .WithMany()
                        .HasForeignKey("UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ProfessionalType");

                    b.Navigation("User");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Relative", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.Patient", "Patient")
                        .WithMany("FamilyAggregate")
                        .HasForeignKey("IdPatient")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Patient");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("LusoHealthClient.Server.Models.Users.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("LusoHealthClient.Server.Models.Users.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Patient", b =>
                {
                    b.Navigation("FamilyAggregate");
                });

            modelBuilder.Entity("LusoHealthClient.Server.Models.Users.Professional", b =>
                {
                    b.Navigation("Certificates");

                    b.Navigation("Reviews");

                    b.Navigation("Services");
                });
#pragma warning restore 612, 618
        }
    }
}
