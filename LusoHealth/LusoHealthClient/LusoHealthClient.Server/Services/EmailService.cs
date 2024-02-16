using LusoHealthClient.Server.DTOs.Authentication;
using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;

namespace LusoHealthClient.Server.Services
{
    public class EmailService
    {
        private IConfiguration _congif;

        public EmailService(IConfiguration config)
        {
            _congif = config;
        }

        public async Task<bool> SendEmailAsync(EmailSendDto emailSend)
        {
            MailjetClient client = new MailjetClient(_congif["MailJet:ApiKey"], _congif["MailJet:SecretKey"]);

            var email = new TransactionalEmailBuilder()
                .WithFrom(new SendContact(_congif["Email:From"], _congif["Email:ApplicationName"]))
                .WithSubject(emailSend.Subject)
                .WithHtmlPart(emailSend.Body)
                .WithTo(new SendContact(emailSend.To))
                .Build();

            var response = await client.SendTransactionalEmailAsync(email);
            if(response.Messages != null)
            {
                if (response.Messages[0].Status == "success")
                {
                    return true;
                }
            }
            return false;
        }
    }
}
