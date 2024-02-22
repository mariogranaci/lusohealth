using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using LusoHealthClient.Server.Models.Users;

namespace LusoHealthClient.Server.Models.Professionals
{
    public class Service
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Professional")]
        public string IdProfessional { get; set; }
        [ForeignKey("Specialty")]
        public int IdSpecialty { get; set; }
        public double PricePerHour { get; set; }
        public bool Online { get; set; }
        public bool Presential { get; set; }
        public bool Home { get; set; }

        #region Navigation Properties
        public Professional Professional { get; set; }
        public Specialty Specialty { get; set; }
        #endregion
    }

}

    //////public class Service
    //////{
    //////    [Key]
    //////    public int Id { get; set; }

    //////    // Remova a chave estrangeira que referenciava Professional
    //////    // [Key, ForeignKey("Professional")]
    //////    // public string IdProfessional { get; set; }

    //////    [ForeignKey("Professional")]  // Adicione esta linha para configurar a relação
    //////    public Professional Professional { get; set; }

    //////    [ForeignKey("Specialty")]
    //////    public int IdSpecialty { get; set; }
    //////    public double PricePerHour { get; set; }
    //////    public bool Online { get; set; }
    //////    public bool Presential { get; set; }
    //////    public bool Home { get; set; }

    //////    #region Navigation Properties
    //////    public Specialty Specialty { get; set; }
    //////    #endregion
    //////}