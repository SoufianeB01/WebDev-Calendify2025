using Microsoft.AspNetCore.Mvc;
using Calendify.Models;

namespace Calendify.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        // POST api/login
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Username and password are required" });

            //Check if login is correct
            if (request.Username == "user" && request.Password == "password")
            {
                return Ok(new { message = "Login successful" });
            }
            else
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }


        }

        // GET api/login/session
        [HttpGet("session")]
        public IActionResult CheckSession()
        {
            return Ok(new { isLoggedIn = false });
        }
    }
}