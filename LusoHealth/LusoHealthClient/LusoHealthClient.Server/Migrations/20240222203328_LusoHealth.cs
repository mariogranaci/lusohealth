﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LusoHealthClient.Server.Migrations
{
    /// <inheritdoc />
    public partial class LusoHealth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(1)", nullable: false),
                    Nif = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSuspended = table.Column<bool>(type: "bit", nullable: false),
                    IsBlocked = table.Column<bool>(type: "bit", nullable: false),
                    ProfilePicPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserType = table.Column<string>(type: "nvarchar(1)", nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Agenda = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Patients_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Professionals",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Agenda = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfessionalTypeId = table.Column<int>(type: "int", nullable: true),
                    TypeId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Professionals", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Professionals_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Professionals_ProfessionalTypes_ProfessionalTypeId",
                        column: x => x.ProfessionalTypeId,
                        principalTable: "ProfessionalTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Professionals_ProfessionalTypes_TypeId",
                        column: x => x.TypeId,
                        principalTable: "ProfessionalTypes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Specialties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimesScheduled = table.Column<int>(type: "int", nullable: false),
                    ProfessionalTypeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Specialties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Specialties_ProfessionalTypes_ProfessionalTypeId",
                        column: x => x.ProfessionalTypeId,
                        principalTable: "ProfessionalTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Relative",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(1)", nullable: false),
                    Nif = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthDate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdPatient = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relative", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relative_Patients_IdPatient",
                        column: x => x.IdPatient,
                        principalTable: "Patients",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Certificate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Path = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdProfessional = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certificate_Professionals_IdProfessional",
                        column: x => x.IdProfessional,
                        principalTable: "Professionals",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdProfessional = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdSpecialty = table.Column<int>(type: "int", nullable: false),
                    PricePerHour = table.Column<double>(type: "float", nullable: false),
                    Online = table.Column<bool>(type: "bit", nullable: false),
                    Presential = table.Column<bool>(type: "bit", nullable: false),
                    Home = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_Professionals_IdProfessional",
                        column: x => x.IdProfessional,
                        principalTable: "Professionals",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Services_Specialties_IdSpecialty",
                        column: x => x.IdSpecialty,
                        principalTable: "Specialties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    IdPatient = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdService = table.Column<int>(type: "int", nullable: false),
                    Stars = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PatientUserID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    ProfessionalUserID = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => new { x.IdPatient, x.IdService });
                    table.ForeignKey(
                        name: "FK_Reviews_Patients_PatientUserID",
                        column: x => x.PatientUserID,
                        principalTable: "Patients",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Reviews_Professionals_ProfessionalUserID",
                        column: x => x.ProfessionalUserID,
                        principalTable: "Professionals",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Reviews_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "BirthDate", "ConcurrencyStamp", "Email", "EmailConfirmed", "FirstName", "Gender", "IsBlocked", "IsSuspended", "LastName", "LockoutEnabled", "LockoutEnd", "Nif", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "ProfilePicPath", "Provider", "SecurityStamp", "TwoFactorEnabled", "UserName", "UserType" },
                values: new object[,]
                {
                    { "1", 0, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2f65d388-6663-4d0a-845e-983ba135a3c2", "user1@mail.com", true, "User1", "M", false, false, "Family", false, null, "123456789", "user1@mail.com", null, "AQAAAAIAAYagAAAAEHSx9y2nUurguDj1DiI3emUxmBKnXkEv87hrzvzfdXwJ33d5XMbKC5oXQrs8gjD7dg==", "987654321", false, null, null, "dfce072e-493e-4f40-bed3-808a71814c31", false, "123456789_497", "U" },
                    { "2", 0, new DateTime(1995, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "cc656991-c96a-41d4-9c18-698b17d1ec82", "user2@mail.com", true, "User2", "F", false, false, "Family", false, null, "987654321", "user2@mail.com", null, "AQAAAAIAAYagAAAAEKH6RGSn/j5PUbkLexvcHESWC3+3IwUmynao508pfCxAML5XsS9SAAAWpgi3gQ4eZw==", "123456789", false, null, null, "1c43dfaa-a314-4337-b617-0484848b4922", false, "987654321_497", "U" },
                    { "2378562", 0, new DateTime(1994, 4, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "14e0005e-c195-4fba-bffb-80815b0ddd91", "usergoogle@mail.com", true, "User", "M", false, false, "Google", false, null, "123215648", "usergoogle@mail.com", null, "AQAAAAIAAYagAAAAEBiJ42Y1s0u6Eq3EmBnLfGf91Gwf2MOUChjaYbILTCUIbkKroZTAtZAeMCcI2ta+fg==", "231564789", false, "https://img.freepik.com/fotos-premium/empreendedor-deprimido-triste-em-homem-de-trabalhador-de-terno-formal-sentado-perto-de-uma-rua-ao-ar-livre-perto-do-centro-de-negocios-de-escritorio-moderno-homem-de-negocios-chateado-perdeu-o-emprego-devido-a-um-funcionario-de-crise-financeira-tem-problema-lado-de-fora_321831-6752.jpg", "google", "5d3bea4b-dd06-408d-aeea-f74f2674e27c", false, "123215648_497", "P" },
                    { "3", 0, new DateTime(1988, 8, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "2534de17-799c-4fd3-bc0b-27ce84f7242b", "user3@mail.com", true, "User3", "M", false, false, "Family", false, null, "111223344", "user3@mail.com", null, "AQAAAAIAAYagAAAAEC/LX8CD4T33ZjUYaXvX0XYJyxFU74pRfsNom5Q+XqHk9zBQlvx993RnpgVvIItmjA==", "555555555", false, null, null, "e9602db6-89a9-4a3d-9d42-ed555b75a7a2", false, "111223344_497", "U" },
                    { "4", 0, new DateTime(1992, 12, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "ff255914-8e8b-4e7b-b948-def2e31596ea", "user4@mail.com", true, "User4", "F", false, false, "Family", false, null, "999888777", "user4@mail.com", null, "AQAAAAIAAYagAAAAELv5VOktIUgfZR5OovQ1uaa5PEKe5m2/e+zUFK2hsTVmW2QvQMe4d65xfc+ruwYZ+g==", "444444444", false, null, null, "13507f00-26b1-4335-9ecc-c3338d13797e", false, "999888777_497", "U" },
                    { "5", 0, new DateTime(1997, 7, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "7031345a-d713-447c-a71e-1a664ccf504c", "user5@mail.com", true, "User5", "M", false, false, "Family", false, null, "555444333", "user5@mail.com", null, "AQAAAAIAAYagAAAAEG5owuN7xAFMbFo55FDgyYzBS4hEGTWR6Kd31XibQu4qThZ/Xq0GBAuq7HlWLBrO5w==", "333333333", false, null, null, "7110a49a-dbab-4862-a400-ea4f16801a14", false, "333333333_497", "P" },
                    { "6", 0, new DateTime(1994, 4, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "d3bb12ea-042e-4c4a-a629-421894dd9813", "user6@mail.com", true, "User6", "F", false, false, "Family", false, null, "777666555", "user6@mail.com", null, "AQAAAAIAAYagAAAAEJkxTf8mWSlkJGFPyVYwPqu8/76Mwb89QDITfQgUU1jiolaNkbesY9vW1s/kRQZkQQ==", "222222222", false, null, null, "f1d409e9-94ef-4642-8b72-1a9d25c6b85f", false, "777666555_497", "P" }
                });

            migrationBuilder.InsertData(
                table: "ProfessionalTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Medicina" },
                    { 2, "Enfermagem" },
                    { 3, "Medicina Dentária" },
                    { 4, "Fisioterapia" },
                    { 5, "Nutricionismo" },
                    { 6, "Psicologia" },
                    { 7, "Fisiologia" },
                    { 8, "Outros" }
                });

            migrationBuilder.InsertData(
                table: "Patients",
                columns: new[] { "UserID", "Agenda" },
                values: new object[,]
                {
                    { "1", null },
                    { "2", null },
                    { "3", null },
                    { "4", null }
                });

            migrationBuilder.InsertData(
                table: "Professionals",
                columns: new[] { "UserID", "Agenda", "Location", "ProfessionalTypeId", "TypeId" },
                values: new object[,]
                {
                    { "2378562", null, null, null, null },
                    { "5", null, null, null, null },
                    { "6", null, null, null, null }
                });

            migrationBuilder.InsertData(
                table: "Specialties",
                columns: new[] { "Id", "Name", "ProfessionalTypeId", "TimesScheduled" },
                values: new object[,]
                {
                    { 1, "Anatomia Patológica", 1, 0 },
                    { 2, "Anestesiologia", 1, 0 },
                    { 3, "Cardiologia", 1, 0 },
                    { 4, "Cardiologia Pediátrica", 1, 0 },
                    { 5, "Cirurgia Cardíaca", 1, 0 },
                    { 6, "Cirurgia Geral", 1, 0 },
                    { 7, "Cirurgia Maxilofacial", 1, 0 },
                    { 8, "Cirurgia Pediátrica", 1, 0 },
                    { 9, "Cirurgia Plástica, Reconstrutiva e Estética", 1, 0 },
                    { 10, "Cirurgia Torácica", 1, 0 },
                    { 11, "Cirurgia Vascular", 1, 0 },
                    { 12, "Clínica Geral", 1, 0 },
                    { 13, "Cuidados Paliativos", 1, 0 },
                    { 14, "Dermatologia", 1, 0 },
                    { 15, "Endocrinologia", 1, 0 },
                    { 16, "Estomatologia", 1, 0 },
                    { 17, "Farmacologia Clínica", 1, 0 },
                    { 18, "Gastrenterologia", 1, 0 },
                    { 19, "Gastrenterologia Pediátrica", 1, 0 },
                    { 20, "Genética Médica", 1, 0 },
                    { 21, "Ginecologia-Obstetrícia", 1, 0 },
                    { 22, "Hematologia Clínica", 1, 0 },
                    { 23, "Imagiologia", 1, 0 },
                    { 24, "Imunoalergologia", 1, 0 },
                    { 25, "Imunohemoterapia", 1, 0 },
                    { 26, "Infecciologia", 1, 0 },
                    { 27, "Medicina Capilar", 1, 0 },
                    { 28, "Medicina de Trabalho", 1, 0 },
                    { 29, "Medicina Desportiva", 1, 0 },
                    { 30, "Medicina Estética", 1, 0 },
                    { 31, "Medicina Física e de Reabilitação", 1, 0 },
                    { 32, "Medicina Geral e Familiar", 1, 0 },
                    { 33, "Medicina Intensiva", 1, 0 },
                    { 34, "Medicina Interna", 1, 0 },
                    { 35, "Medicina Nuclear", 1, 0 },
                    { 36, "Nefrologia", 1, 0 },
                    { 37, "Nefrologia Pediátrica", 1, 0 },
                    { 38, "Neonatologia", 1, 0 },
                    { 39, "Neurocirurgia", 1, 0 },
                    { 40, "Neurologia", 1, 0 },
                    { 41, "Neuropediatria", 1, 0 },
                    { 42, "Neurorradiologia", 1, 0 },
                    { 43, "Oftalmologia", 1, 0 },
                    { 44, "Oncologia Médica", 1, 0 },
                    { 45, "Ortopedia", 1, 0 },
                    { 46, "Otorrinolaringologia", 1, 0 },
                    { 47, "Patologia Clínica", 1, 0 },
                    { 48, "Pediatria", 1, 0 },
                    { 49, "Pediatria do Desenvolvimento", 1, 0 },
                    { 50, "Pneumologia", 1, 0 },
                    { 51, "Sem Especialidade", 2, 0 },
                    { 52, "Médico-Cirúrgica", 2, 0 },
                    { 53, "Pediátrica", 2, 0 },
                    { 54, "Obstétrica e Ginecológica", 2, 0 },
                    { 55, "Saúde Mental", 2, 0 },
                    { 56, "Geriátrica", 2, 0 },
                    { 57, "Comunitária", 2, 0 },
                    { 58, "Oncológica", 2, 0 },
                    { 59, "Cuidados Paliativos", 2, 0 },
                    { 60, "Reabilitação", 2, 0 },
                    { 61, "Cardiovascular", 2, 0 },
                    { 62, "Nefrológica", 2, 0 },
                    { 63, "Dermatológica", 2, 0 },
                    { 64, "Saúde da Mulher", 2, 0 },
                    { 65, "Cirurgia Plástica", 2, 0 },
                    { 66, "Saúde do Trabalhador", 2, 0 },
                    { 67, "Neonatal", 2, 0 },
                    { 68, "Saúde da Família", 2, 0 },
                    { 69, "Transplantes", 2, 0 },
                    { 70, "Diabetes", 2, 0 },
                    { 71, "Cuidados Continuados", 2, 0 },
                    { 101, "Sem Especialidade", 3, 0 },
                    { 102, "Ortodontia", 3, 0 },
                    { 103, "Periodontia", 3, 0 },
                    { 104, "Endodontia", 3, 0 },
                    { 105, "Cirurgia Oral e Maxilofacial", 3, 0 },
                    { 106, "Odontopediatria", 3, 0 },
                    { 107, "Dentística Restauradora", 3, 0 },
                    { 108, "Implantologia", 3, 0 },
                    { 109, "Ortopedia Funcional dos Maxilares", 3, 0 },
                    { 110, "Medicina Oral", 3, 0 },
                    { 111, "Patologia Oral", 3, 0 },
                    { 112, "Radiologia Odontológica", 3, 0 },
                    { 113, "Odontologia do Trabalho", 3, 0 },
                    { 114, "Sem Especialidade", 4, 0 },
                    { 115, "Desportiva", 4, 0 },
                    { 116, "Neurológica", 4, 0 },
                    { 117, "Ortopédica", 4, 0 },
                    { 118, "Respiratória", 4, 0 },
                    { 119, "Pediátrica", 4, 0 },
                    { 120, "Geriátrica", 4, 0 },
                    { 121, "Cardiovascular", 4, 0 },
                    { 122, "Aquática", 4, 0 },
                    { 123, "Feminina", 4, 0 },
                    { 124, "Trabalho", 4, 0 },
                    { 125, "Oncológica", 4, 0 },
                    { 126, "Reumatológica", 4, 0 },
                    { 127, "Intensiva", 4, 0 },
                    { 128, "Vestibular", 4, 0 },
                    { 129, "Traumato-Ortopédica", 4, 0 },
                    { 130, "Manual", 4, 0 },
                    { 131, "Dermatofuncional", 4, 0 },
                    { 132, "Terapia Intensiva Neonatal", 4, 0 },
                    { 133, "Sem Especialidade", 5, 0 },
                    { 134, "Clínica", 5, 0 },
                    { 135, "Esportiva", 5, 0 },
                    { 136, "Materno-Infantil", 5, 0 },
                    { 137, "Funcional", 5, 0 },
                    { 138, "Estética", 5, 0 },
                    { 139, "Geriátrica", 5, 0 },
                    { 140, "Oncológica", 5, 0 },
                    { 141, "Comportamental", 5, 0 },
                    { 142, "Escolar", 5, 0 },
                    { 143, "Enteral e Parenteral", 5, 0 },
                    { 144, "Saúde Pública", 5, 0 },
                    { 145, "Sem Especialidade", 6, 0 },
                    { 146, "Clínica", 6, 0 },
                    { 147, "Educacional", 6, 0 },
                    { 148, "Organizacional e do Trabalho", 6, 0 },
                    { 149, "Social", 6, 0 },
                    { 150, "Desportiva", 6, 0 },
                    { 151, "Saúde", 6, 0 },
                    { 152, "Forense", 6, 0 },
                    { 153, "Desenvolvimento", 6, 0 },
                    { 154, "Cognitiva", 6, 0 },
                    { 155, "Neuropsicologia", 6, 0 },
                    { 156, "Positiva", 6, 0 },
                    { 157, "Ambiental", 6, 0 },
                    { 158, "Transpessoal", 6, 0 },
                    { 159, "Familiar", 6, 0 },
                    { 160, "Tráfego", 6, 0 },
                    { 161, "Personalidade", 6, 0 },
                    { 162, "Existencial", 6, 0 },
                    { 163, "Consumidor", 6, 0 },
                    { 164, "Envelhecimento", 6, 0 },
                    { 165, "Escolar", 6, 0 },
                    { 166, "Trabalho e Carreira", 6, 0 },
                    { 167, "Aprendizagem", 6, 0 },
                    { 168, "Cultural", 6, 0 },
                    { 169, "Espectro Autista", 6, 0 },
                    { 170, "Trauma", 6, 0 },
                    { 171, "Sexualidade", 6, 0 },
                    { 172, "Desportiva", 7, 0 },
                    { 173, "Cardiovascular", 7, 0 },
                    { 174, "Respiratória", 7, 0 },
                    { 175, "Renal", 7, 0 },
                    { 176, "Endócrina", 7, 0 },
                    { 177, "Neurofisiologia", 7, 0 },
                    { 178, "Reprodutiva", 7, 0 },
                    { 179, "Sistema Digestivo", 7, 0 },
                    { 180, "Terapia Ocupacional", 8, 0 },
                    { 181, "Quiropraxia", 8, 0 },
                    { 182, "Acupuntura", 8, 0 },
                    { 183, "Podologia", 8, 0 },
                    { 184, "Osteopatia", 8, 0 },
                    { 185, "Musicoterapia", 8, 0 },
                    { 186, "Arteterapia", 8, 0 },
                    { 187, "Terapia Comportamental", 8, 0 },
                    { 188, "Terapia Holística", 8, 0 },
                    { 189, "Terapia Familiar", 8, 0 },
                    { 190, "Terapia de Casal", 8, 0 },
                    { 191, "Terapia de Grupo", 8, 0 },
                    { 192, "Terapia Cognitivo-Comportamental (TCC)", 8, 0 },
                    { 193, "Naturopatia", 8, 0 },
                    { 194, "Homeopatia", 8, 0 },
                    { 195, "Hipnoterapia", 8, 0 },
                    { 196, "Reflexologia", 8, 0 },
                    { 197, "Shiatsu", 8, 0 },
                    { 198, "Massoterapia", 8, 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Certificate_IdProfessional",
                table: "Certificate",
                column: "IdProfessional");

            migrationBuilder.CreateIndex(
                name: "IX_Professionals_ProfessionalTypeId",
                table: "Professionals",
                column: "ProfessionalTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Professionals_TypeId",
                table: "Professionals",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Relative_IdPatient",
                table: "Relative",
                column: "IdPatient");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PatientUserID",
                table: "Reviews",
                column: "PatientUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProfessionalUserID",
                table: "Reviews",
                column: "ProfessionalUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ServiceId",
                table: "Reviews",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_IdProfessional",
                table: "Services",
                column: "IdProfessional");

            migrationBuilder.CreateIndex(
                name: "IX_Services_IdSpecialty",
                table: "Services",
                column: "IdSpecialty");

            migrationBuilder.CreateIndex(
                name: "IX_Specialties_ProfessionalTypeId",
                table: "Specialties",
                column: "ProfessionalTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Certificate");

            migrationBuilder.DropTable(
                name: "Relative");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Professionals");

            migrationBuilder.DropTable(
                name: "Specialties");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "ProfessionalTypes");
        }
    }
}
