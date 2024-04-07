using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using LusoHealthClient.Server.Models.Users;
using LusoHealthClient.Server.Models.Professionals;

namespace LusoHealthClient.Server.Models.FeedbackAndReports
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Patient")]
        public string IdPatient { get; set; }
        [ForeignKey("Service")] 
        public int IdService { get; set; }
        public DateTime Timestamp { get; set; }
        public ReviewState? State { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
        #region Navigation Properties
        public Patient Patient { get; set; }
        public Service Service { get; set; }
        #endregion
    }
}