using System;
using System.ComponentModel.DataAnnotations;

namespace LusoHealthClient.Server.DTOs.Validations
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class AgeOver18ValidationAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
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
