using System.ComponentModel.DataAnnotations;
using LusoHealthClient.Server.Models.Users;

namespace LusoHealthClient.Server.Models.Chat
{
    public class Chat
    {
        [Key]
        public int Id { get; set; }
        public string IdPatient { get; set; }
        public string IdProfessional { get; set; }
        public int AppointmentId { get; set; }
        public bool IsActive { get; set; }
        public List<Message> Messages { get; set; }

        #region Navigation Properties
        public User Patient { get; set; }
        public User Professional { get; set; }
        #endregion
    }
}
