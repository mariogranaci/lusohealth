namespace LusoHealthClient.Server.DTOs.Authentication
{
	/// <summary>
	///(DTO) para enviar um email.
	/// </summary>
	public class EmailSendDto
    {
		/// <summary>
		/// Endereço de email do destinatário.
		/// </summary>
		public string To { get; set; }

		/// <summary>
		/// Assunto do email.
		/// </summary>
		public string Subject { get; set; }

		/// <summary>
		/// Corpo do email.
		/// </summary>
		public string Body { get; set; }

		/// <summary>
		/// Construtor da classe EmailSendDto.
		/// </summary>
		/// <param name="to">Endereço de email do destinatário.</param>
		/// <param name="subject">Assunto do email.</param>
		/// <param name="body">Corpo do email.</param>
		public EmailSendDto(string to, string subject, string body)
        {
            To = to;
            Subject = subject;
            Body = body;
        }



    }
}
