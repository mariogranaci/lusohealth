namespace LusoHealthClient.Server.DTOs.Authentication
{
    public class EmailSendDto
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        
        public EmailSendDto(string to, string subject, string body)
        {
            To = to;
            Subject = subject;
            Body = body;
        }



    }
}
