namespace LusoHealthClient.Server.DTOs.Profile
{
    public class AddReviewDto
    {
        public int IdService { get; set; }
        public int Stars { get; set; }
        public string Description { get; set; }
    }
}
