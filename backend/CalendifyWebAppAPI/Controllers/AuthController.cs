using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Services.Interfaces;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

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
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { message = "Email and password are required" });

            var (success, error, employee, isAdmin) = await _authService.ValidateCredentialsAsync(login.Email, login.Password);
            if (!success || employee == null)
                return Unauthorized(new { message = error });

            HttpContext.Session.SetInt32("UserId", employee.UserId);
            HttpContext.Session.SetString("UserEmail", employee.Email);
            HttpContext.Session.SetString("UserRole", isAdmin ? "Admin" : employee.Role);

            return Ok(new
            {
                message = "Login successful",
                userId = employee.UserId,
                email = employee.Email,
                role = isAdmin ? "Admin" : employee.Role
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and password are required" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Name is required" });

            var employee = new Employee
            {
                Name = request.Name,
                Email = request.Email,
                Password = request.Password,
                Role = request.Role ?? "User"
            };

            var (success, error, registeredEmployee) = await _authService.RegisterAsync(employee);
            if (!success || registeredEmployee == null)
                return BadRequest(new { message = error });

            return Ok(new
            {
                message = "Registration successful",
                userId = registeredEmployee.UserId,
                email = registeredEmployee.Email,
                name = registeredEmployee.Name,
                role = registeredEmployee.Role
            });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var id = HttpContext.Session.GetInt32("UserId");
            if (!id.HasValue)
                return Unauthorized(new { message = "No active session" });

            return Ok(new
            {
                userId = id.Value,
                email = HttpContext.Session.GetString("UserEmail"),
                role = HttpContext.Session.GetString("UserRole")
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Role { get; set; }
    }
}