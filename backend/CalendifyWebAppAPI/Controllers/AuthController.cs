using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _auth;
        private readonly IPasswordHasher<Employee> _hasher;

        public AuthController(AppDbContext context, IAuthService auth, IPasswordHasher<Employee> hasher)
        {
            _context = context;
            _auth = auth;
            _hasher = hasher;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var (success, error, employee, isAdmin) = await _auth.ValidateCredentialsAsync(login.Email, login.Password);
            if (!success) return BadRequest(new { message = error });

            HttpContext.Session.SetInt32("UserId", employee!.UserId);
            HttpContext.Session.SetString("UserEmail", employee.Email);
            HttpContext.Session.SetString("UserRole", isAdmin ? "Admin" : employee.Role);

            return Ok(new { message = "Login successful", userId = employee.UserId, email = employee.Email, role = isAdmin ? "Admin" : employee.Role });
        }

        [HttpGet("status")]
        public IActionResult Status()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            var email = HttpContext.Session.GetString("UserEmail");
            var role = HttpContext.Session.GetString("UserRole");
            var isLoggedIn = userId != null;
            var isAdmin = role == "Admin";

            string? name = null;
            if (isLoggedIn)
            {
                var emp = _context.Employees.Find(userId!.Value);
                name = emp?.Name;
            }

            return Ok(new { isLoggedIn, isAdmin, name });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Employee req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password) || string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Name, email and password are required" });

            if (_context.Employees.Any(e => e.Email == req.Email))
                return BadRequest(new { message = "Email already exists" });

            var employee = new Employee
            {
                Name = req.Name,
                Email = req.Email,
                Role = string.IsNullOrWhiteSpace(req.Role) ? "User" : req.Role,
                Password = ""
            };
            employee.Password = _hasher.HashPassword(employee, req.Password);

            _context.Employees.Add(employee);
            _context.SaveChanges();

            return Ok(new { message = "Registered", userId = employee.UserId, email = employee.Email, role = employee.Role });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out" });
        }
    }
}

