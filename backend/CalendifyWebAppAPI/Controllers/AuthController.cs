using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
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

        [HttpPost("register")]
        public IActionResult Register([FromBody] Employee newEmployee)
        {
            if (_context.Employees.Any(e => e.Email == newEmployee.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Default to User role if not provided
            if (string.IsNullOrWhiteSpace(newEmployee.Role))
            {
                newEmployee.Role = "User";
            }

            newEmployee.Password = _authService.HashPassword(newEmployee, newEmployee.Password);
            _context.Employees.Add(newEmployee);
            _context.SaveChanges();
            return Ok(new { message = "Registered", userId = newEmployee.UserId, email = newEmployee.Email, role = newEmployee.Role });
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

