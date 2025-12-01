using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;
using Microsoft.AspNetCore.Identity;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : GenericCrudController<Employee, int>
    {
        private readonly IPasswordHasher<Employee> _passwordHasher;

        public UserController(AppDbContext context, IPasswordHasher<Employee> passwordHasher) : base(context)
        {
            _passwordHasher = passwordHasher;
        }

        [HttpPost("auth")] //post
        public IActionResult Login([FromBody] LoginRequest login)
        {
            var employee_ = _context.Employees.FirstOrDefault(e => e.Email == login.Email);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            var verify = _passwordHasher.VerifyHashedPassword(employee_, employee_.Password, login.Password);
            if (verify == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Incorrect password" });
            }

            HttpContext.Session.SetInt32("UserId", employee_.UserId);
            HttpContext.Session.SetString("UserEmail", employee_.Email);
            HttpContext.Session.SetString("UserRole", employee_.Role);

            return Ok(new { message = "Login successful", userId = employee_.UserId, email = employee_.Email, role = employee_.Role });
        }

        [HttpPost] //post
        public override IActionResult Create([FromBody] Employee newEmployee)
        {
            if (_context.Employees.Any(e => e.Email == newEmployee.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            newEmployee.Password = _passwordHasher.HashPassword(newEmployee, newEmployee.Password);
            _context.Employees.Add(newEmployee);
            _context.SaveChanges();
            return Ok(newEmployee);
        }

        [HttpPut("{id}")] //put
        public override IActionResult Update(int id, [FromBody] Employee updatedEmployee)
        {
            var employee_ = _context.Employees.Find(id);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            // Check if email already exists for another user
            if (updatedEmployee.Email != employee_.Email && 
                _context.Employees.Any(e => e.Email == updatedEmployee.Email && e.UserId != id))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            employee_.Name = updatedEmployee.Name;
            employee_.Email = updatedEmployee.Email;
            employee_.Role = updatedEmployee.Role;
            if (!string.IsNullOrEmpty(updatedEmployee.Password))
            {
                employee_.Password = _passwordHasher.HashPassword(employee_, updatedEmployee.Password);
            }
            _context.SaveChanges();
            return Ok(employee_);
        }

        [HttpGet("email/{email}")] //get
        public IActionResult GetByEmail(string email)
        {
            var employee_ = _context.Employees.FirstOrDefault(e => e.Email == email);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            return Ok(employee_);
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var id = HttpContext.Session.GetInt32("UserId");
            if (id == null)
            {
                return Unauthorized(new { message = "No active session" });
            }
            return Ok(new
            {
                userId = id,
                email = HttpContext.Session.GetString("UserEmail"),
                role = HttpContext.Session.GetString("UserRole")
            });
        }
    }
}

//