using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using LusoHealthClient.Server.Models.Users;
using LusoHealthClient.Server.Models.Professionals;

namespace LusoHealthClient.Server.Models.FeedbackAndReports
{
    public class Review
    {
        [Key]
        public string IdPatient { get; set; }
        [Key]
        public int IdService { get; set; }

        public int Stars { get; set; }
        public string Description { get; set; }

        #region Navigation Properties
        public Patient Patient { get; set; }
        public Service Service { get; set; }
        #endregion
    }
}

    ////////public class Review
    ////////{
    ////////    [Key, ForeignKey("Professional")]
    ////////    public string IdProfessional { get; set; }

    ////////    [Key, ForeignKey("Patient")]
    ////////    public string IdPatient { get; set; }

    ////////    [ForeignKey("Service")]
    ////////    public Service Service { get; set; }

    ////////    public int Stars { get; set; }
    ////////    public string Description { get; set; }

    ////////    #region Navigation Properties
    ////////    public Professional Professional { get; set; }
    ////////    public Patient Patient { get; set; }
    ////////    #endregion
    ////////}