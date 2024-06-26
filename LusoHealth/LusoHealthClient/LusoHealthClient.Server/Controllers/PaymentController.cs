﻿using System.Security.Claims;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.DTOs.Services;
using LusoHealthClient.Server.Models.Services;
using LusoHealthClient.Server.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace LusoHealthClient.Server.Controllers
{
    /// <summary>
	/// Controlador responsável por lidar com as operações relacionadas ao pagamento.
	/// </summary>
    [Authorize(Roles = "Patient,Professional")]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _config;

		/// <summary>
		/// Construtor da classe PaymentController.
		/// </summary>
		/// <param name="context">Contexto da base de dados.</param>
		/// <param name="userManager">O usermanager dos utilizadores.</param>
		/// <param name="config">O logger para registrar informações de log.</param>
		public PaymentController(ApplicationDbContext context, UserManager<User> userManager, IConfiguration config)
        {
            _context = context;
            _userManager = userManager;
            _config = config;
        }

		/// <summary>
		/// Método para criar uma sessão de checkout do Stripe.
		/// </summary>
		[HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest req)
        {
            string? userId;
            string? userEmail;
            try
            {
                userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                userEmail = user.Email;
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao marcar consulta: {ex.Message}");
            }

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                    {
                        "card",
                    },
                CustomerEmail = userEmail,
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmountDecimal = Math.Round((decimal) req.Amount, 2) * 100,
                            Currency = "eur", // Change as per your currency
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Consulta de " + req.ServiceName,
                                /*Description = "Description of the service",*/
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = _config["JWT:ClientUrl"] + "/payment-success?session_id={CHECKOUT_SESSION_ID}",
                CancelUrl = _config["JWT:ClientUrl"] + "/payment-failure?session_id={CHECKOUT_SESSION_ID}",
                Metadata = new Dictionary<string, string>
                {
                    { "user_id", userId },
                    { "appointment_id", req.AppointmentId + "" }
                }
            };
            var service = new SessionService();

            try
            {
                var session = await service.CreateAsync(options);

                return Ok(new CreateCheckoutSessionResponse
                {
                    SessionId = session.Id,
                });
            }
            catch (StripeException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    ErrorMessage = new ErrorMessage
                    {
                        Message = ex.StripeError.Message,
                    }
                });
            }
        }

		/// <summary>
		/// Método para obter detalhes de uma sessão do Stripe.
		/// </summary>
		[HttpGet("get-session-details/{sessionId}")]
        public async Task<ActionResult> GetStripeSession(string sessionId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");


                var service = new SessionService();

                var session = await service.GetAsync(sessionId);
                return Ok(session);
            }
            catch (StripeException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    ErrorMessage = new ErrorMessage
                    {
                        Message = ex.StripeError.Message,
                    }
                });
            }
        }

		/// <summary>
		/// Método para alterar o estado de uma consulta para pendente após o pagamento.
		/// </summary>
		[HttpPost("update-appointment-to-pending")]
        public async Task<ActionResult> ChangeAppointmentState(UpdateAppointmentToPaidDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");


                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
                if (appointment == null) return NotFound("Consulta não encontrada.");

                var userIdOfAppointment = appointment.IdPatient;

                if (userIdOfAppointment != userId) 
                    return Unauthorized("Não tem permissões para alterar o estado desta consulta.");

                appointment.State = AppointmentState.Pending;
                appointment.PaymentIntentId = dto.PaymentIntentId;
                _context.Appointment.Update(appointment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Estado da consulta alterado com sucesso."});
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao confimar pagamento: {ex.Message}");
            }
            
        }

		/// <summary>
		/// Método para cancelar uma consulta.
		/// </summary>
		[HttpDelete("cancel-appointment/{appointmentId}")]
        public async Task<ActionResult> CancelAppointment(int appointmentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == appointmentId);
                if (appointment == null) return NotFound("Consulta não encontrada.");

                var userIdOfAppointment = appointment.IdPatient;

                if (userIdOfAppointment != userId) 
                    return Unauthorized("Não tem permissões para cancelar esta consulta.");

                _context.Appointment.Remove(appointment);

                // find the slot of the appointment and set it to available and set the appointmentid to null
                var slot = await _context.AvailableSlots.FirstOrDefaultAsync(s => s.AppointmentId == appointmentId);

                if (slot != null && slot.AppointmentId == appointmentId)
                {
                    slot.IsAvailable = true;
                    slot.AppointmentId = null;
                    _context.AvailableSlots.Update(slot);
                }
                else
                {
                    return BadRequest("Erro ao cancelar consulta: não foi possível encontrar o slot da consulta.");
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Consulta cancelada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao cancelar consulta: {ex.Message}");
            }
        }

		/// <summary>
		/// Efetua o reembolso de uma consulta cancelada, utilizando o ID da consulta para encontrar o pagamento associado.
		/// </summary>
		/// <param name="dto">Os dados necessários para o pedido de reembolso, incluindo o ID da consulta.</param>
		/// <returns>Um ActionResult representando o resultado da operação de reembolso.</returns>
		[HttpPost("refund-appointment")]
        public async Task<ActionResult> RefundAppointment(RefundRequestDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return BadRequest("Não foi possível encontrar o utilizador.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return NotFound("Não foi possível encontrar o utilizador.");

                var appointment = await _context.Appointment.FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
                if (appointment == null) return NotFound("Consulta não encontrada.");

                var paymentIntentId = appointment.PaymentIntentId;
                if (string.IsNullOrEmpty(paymentIntentId)) return BadRequest("Não foi possível encontrar o pagamento associado a esta consulta, contacte o apoio ao cliente através de lusohealth@gmail.com .");

                var service = new RefundService();
                var refundOptions = new RefundCreateOptions
                {
                    PaymentIntent = paymentIntentId,
                };

                var refund = await service.CreateAsync(refundOptions);

                return Ok(new { message = "Reembolso efetuado com sucesso." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao reembolsar consulta, contacte o apoio ao cliente através de lusohealth@gmail.com .");
            }
        }

    }
}
