using System;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Validations
{
	/// <summary>
	/// Atributo de validação para garantir que a idade seja superior a 18 anos.
	/// </summary>
	[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class AgeOver18ValidationAttribute : ValidationAttribute
    {
#pragma warning disable CS8765 // A nulidade do tipo de parâmetro não corresponde ao membro substituído (possivelmente devido a atributos de nulidade).
        public override bool IsValid(object value)
#pragma warning restore CS8765 // A nulidade do tipo de parâmetro não corresponde ao membro substituído (possivelmente devido a atributos de nulidade).
        {
            if (value == null)
            {
                return true;  // Let the Required attribute handle this
            }

            DateTime dateOfBirth = Convert.ToDateTime(value);
            DateTime today = DateTime.Today;
            int age = today.Year - dateOfBirth.Year;

            // Adjust age if the birthday hasn't occurred yet this year
            if (dateOfBirth.Date > today.AddYears(-age))
            {
                age--;
            }

            return age >= 18;
        }
    }

}
