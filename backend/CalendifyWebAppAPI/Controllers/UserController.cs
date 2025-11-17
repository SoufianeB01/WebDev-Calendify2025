using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;
using CalendifyWebAppAPI.Services.Interfaces;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : GenericCrudController<Employee, int>
    {
        private readonly IUserService _userService;

        public UserController(AppDbContext context, IUserService userService) : base(context)
        {
            _userService = userService;
        }

        [HttpPost("auth")] //post
        public IActionResult Login([FromBody] LoginRequest login)
        {
            var (success, user, error) = _userService.Login(login.Email, login.Password);
            if (!success || user == null)
            {
                if (error == "Employee not found")
                {
                    return NotFound(new { message = error });
                }
                return BadRequest(new { message = error ?? "Login failed" });
            }

            return Ok(new { message = "Login successful", userId = user.UserId, email = user.Email, role = user.Role });
        }

        [HttpPost] //post
        public override IActionResult Create([FromBody] Employee newEmployee)
        {
            try
            {
                var created = _userService.Register(newEmployee);
                return Ok(created);
            }
            catch (InvalidOperationException)
            {
                return BadRequest(new { message = "Email already exists" });
            }
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
            employee_.Password = updatedEmployee.Password;
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
    }
}
