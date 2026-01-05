using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Services.Interfaces;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;

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
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { message = "Email and password are required" });

            var (success, error, employee, isAdmin) = await _authService.ValidateCredentialsAsync(login.Email, login.Password);
            if (!success || employee == null)
                return Unauthorized(new { message = error });

            HttpContext.Session.SetString("UserId", employee.UserId.ToString());
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

        [HttpGet("me")]
        public IActionResult Me()
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized(new { message = "No active session" });

            return Ok(new
            {
                userId = userIdStr,
                email = HttpContext.Session.GetString("UserEmail"),
                role = HttpContext.Session.GetString("UserRole")
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logout successful" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Employee employee)
        {
            if (string.IsNullOrWhiteSpace(employee.Email) || string.IsNullOrWhiteSpace(employee.Password))
                return BadRequest(new { message = "Email and password are required" });

            // Check if employee with this email already exists
            var existing = await _context.Employees.FirstOrDefaultAsync(e => e.Email == employee.Email);
            if (existing != null)
                return BadRequest(new { message = "Email already registered" });

            employee.UserId = Guid.NewGuid();
            employee.Role = "Employee"; // Default role
            employee.Password = _authService.HashPassword(employee, employee.Password);

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful", userId = employee.UserId });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and password are required" });

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == request.Email);
            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            employee.Password = _authService.HashPassword(employee, request.Password);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successful" });
        }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}