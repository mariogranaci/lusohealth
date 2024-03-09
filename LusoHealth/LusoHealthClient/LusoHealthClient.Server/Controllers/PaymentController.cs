using LusoHealthClient.Server.DTOs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace LusoHealthClient.Server.Controllers
{
    /*[Authorize(Roles="Patient")]*/
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        public PaymentController()
        {
        }

        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest req)
        {

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                    {
                        "card",
                    },
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
                                Name = req.ServiceName,
                                /*Description = "Description of the service",*/
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = "https://localhost:4200/payment-success?session_id={CHECKOUT_SESSION_ID}" + "&id=" + req.AppointmentId,
                CancelUrl = "https://localhost:4200/payment-failure?session_id={CHECKOUT_SESSION_ID}" + "&id=" + req.AppointmentId,
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

        /*[HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] decimal price)
        {

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                    {
                        "card",
                    },
                LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = "eur",
                                UnitAmount = (long)(price * 100), // Convert price to cents
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = "Your Product Name",
                                },
                            },
                            Quantity = 1,
                        },
                    },
                Mode = "payment",
                SuccessUrl = "https://localhost:4200/payment-success",
                CancelUrl = "https://localhost:4200/payment-failure",
            };
            var service = new SessionService();

            try
            {
                var session = await service.CreateAsync(options);

                return Ok(new { SessionId = session.Id });
            }
            catch (StripeException ex)
            {
                // Log the exception or handle it accordingly
                return BadRequest(new { error = ex.Message });
            }
        }*/

        /*[HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest req)
        {
            var options = new SessionCreateOptions
            {
                SuccessUrl = req.SuccessUrl,
                CancelUrl = req.FailureUrl,
                PaymentMethodTypes = new List<string>
                {
                    "card",
                },
                Mode = "subscription",
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = req.Price,
                        Quantity = 1,
                    },
                },
            };

            var service = new SessionService();
            service.Create(options);
            try
            {
                var session = await service.CreateAsync(options);
                return Ok(new CreateCheckoutSessionResponse
                {
                    SessionId = session.Id,
                    PublicKey = _stripeSettings.PublicKey
                });
            }
            catch (StripeException e)
            {
                Console.WriteLine(e.StripeError.Message);
                return BadRequest(new ErrorResponse
                {
                    ErrorMessage = new ErrorMessage
                    {
                        Message = e.StripeError.Message,
                    }
                });
            }
        }*/

    }
}
