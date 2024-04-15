using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Validations
{
	/// <summary>
	/// Atributo de validação que permite especificar o comprimento de uma string opcional.
	/// </summary>
	[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class OptionalStringLengthAttribute : ValidationAttribute
    {
        public int MinLength { get; set; }
        public int MaxLength { get; set; }

#pragma warning disable CS8765 // A nulidade do tipo de parâmetro não corresponde ao membro substituído (possivelmente devido a atributos de nulidade).
        public override bool IsValid(object value)
#pragma warning restore CS8765 // A nulidade do tipo de parâmetro não corresponde ao membro substituído (possivelmente devido a atributos de nulidade).
        {
            if (value.ToString().IsNullOrEmpty())
            {
                return true;  // Skip validation if the value is not provided
            }

            string stringValue = value + "";

            // Check the string length
            int length = stringValue.Length;
            return length >= MinLength && length <= MaxLength;
        }
    }
}
