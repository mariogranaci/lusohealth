﻿using LusoHealthClient.Server.DTOs.Validations;
using System.ComponentModel.DataAnnotations;
using System.Drawing;

namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para o registo de novos utilizadores.
	/// </summary>
	public class RegisterDto
    {
        [Required(ErrorMessage = "Introduza o seu nome")]
        [MaxLength(50, ErrorMessage = "Não pode introduzir mais de {1} caracteres")]
        [MinLength(3, ErrorMessage = "O nome tem um mínimo de {1} caracteres")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Introduza o seu apelido")]
        [MaxLength(50, ErrorMessage = "Não pode introduzir mais de {1} caracteres")]
        [MinLength(3, ErrorMessage = "O apelido tem um mínimo de {1} caracteres")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Introduza uma password")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "A password deve conter entre {2} e {1} caracteres")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Confirme a password")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "A password deve conter entre {2} e {1} caracteres")]
        public string ConfirmarPassword { get; set; }

        [Required(ErrorMessage = "O NIF é obrigatório")]
        [StringLength(9, MinimumLength = 9, ErrorMessage = "NIF deve ter 9 dígitos")]
        public string Nif { get; set; }

        [OptionalStringLength(MinLength = 9, MaxLength = 9, ErrorMessage = "O telemóvel deve ter 9 dígitos")]

        public string Telemovel { get; set; }


        [Required(ErrorMessage ="Introduza uma data de nascimento")]
        [DataType(DataType.Date, ErrorMessage = "Introduza uma data válida")]
        [AgeOver18Validation(ErrorMessage = "O usuário deve ter mais de 18 anos.")]
        public DateTime DataNascimento{ get; set; }

        [Required(ErrorMessage = "Selecione um género")]
        public char Genero { get; set; }

        [Required(ErrorMessage= "Escolha um tipo de conta")]
        public char TipoUser { get; set; }
        public int? ProfessionalTypeId { get; set; }
    }
}
