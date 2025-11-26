using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var (success, error, employee, isAdmin) = await _authService.ValidateCredentialsAsync(login.Email, login.Password);
            if (!success || employee == null)
            {
                return BadRequest(new { message = error });
            }

            // Register session
            HttpContext.Session.SetString("IsLoggedIn", "true");
            HttpContext.Session.SetString("UserId", employee.UserId.ToString());
            HttpContext.Session.SetString("UserName", employee.Name ?? employee.Email);
            HttpContext.Session.SetString("Role", isAdmin ? "Admin" : "User");

            return Ok(new { message = "Login successful", name = employee.Name, role = isAdmin ? "Admin" : "User" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out" });
        }

        [HttpGet("session")]
        public IActionResult SessionStatus()
        {
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn") == "true";
            var name = HttpContext.Session.GetString("UserName") ?? string.Empty;
            var role = HttpContext.Session.GetString("Role") ?? string.Empty;
            return Ok(new { isLoggedIn, name, role });
        }
    }
}

