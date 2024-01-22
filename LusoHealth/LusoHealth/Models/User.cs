namespace LusoHealth.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email {  get; set; }
        public string? Password { get; set; }
        public string Name { get; set; }
        public char Gender { get; set; }
        public string Nif { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsValid { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsBlocked { get; set; }
        public string? ProfilePicPath { get; set; }
        public char UserType { get; set; }
    }
}
