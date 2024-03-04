﻿using LusoHealthClient.Server.Models.Services;

namespace LusoHealthClient.Server.DTOs.Services
{
    public class AppointmentDto
	{
		public int? Id { get; set; }
		public DateTime? Timestamp { get; set; }
		public string? Location { get; set; }
		public string? Type { get; set; }
		public string? Description { get; set; }
		public string? State { get; set; }
		public int? Duration { get; set; }
		public string? IdPatient { get; set; }
		public string? IdProfesional { get; set; }
		public int? IdService { get; set; }
	
	}
}