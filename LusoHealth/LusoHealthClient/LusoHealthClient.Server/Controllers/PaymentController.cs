using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace LusoHealthClient.Server.Controllers
{
    /*[Authorize(Roles="Patient")]*/
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        public PaymentController()
        {
            StripeConfiguration.ApiKey = "sk_test_51OqJA2GgRte7XVeaVWapMgy98z3L2UvoTQRC0f9hbfzFNIeBFQ4tuuUiCVbDth17FHfrOe5hO9J5wKIWVjhj01Di006PFQisT3";
        }


        [HttpGet("products")]
        public IActionResult GetProducts()
        {
            var options = new ProductListOptions { Limit = 3 };
            var service = new ProductService();
            StripeList<Product> products = service.List(options);

            return Ok(products);
        }

    }
}
