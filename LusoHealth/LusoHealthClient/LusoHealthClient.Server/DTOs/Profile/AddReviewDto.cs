namespace LusoHealthClient.Server.DTOs.Profile
{
	/// <summary>
	///(DTO) para adicionar uma avaliação de serviço.
	/// </summary>
	public class AddReviewDto
    {
        public int IdService { get; set; }
        public int IdSpecialty { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
    }
}
