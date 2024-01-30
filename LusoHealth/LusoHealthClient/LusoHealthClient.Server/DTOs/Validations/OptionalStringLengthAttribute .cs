using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Validations
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class OptionalStringLengthAttribute : ValidationAttribute
    {
        public int MinLength { get; set; }
        public int MaxLength { get; set; }

        public override bool IsValid(object value)
        {
            if (value.ToString().IsNullOrEmpty())
            {
                return true;  // Skip validation if the value is not provided
            }

            string stringValue = value.ToString();

            // Check the string length
            int length = stringValue.Length;
            return length >= MinLength && length <= MaxLength;
        }
    }
}
