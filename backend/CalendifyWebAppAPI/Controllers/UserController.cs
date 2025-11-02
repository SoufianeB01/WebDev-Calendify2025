using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("auth")] //post
        public IActionResult Login([FromBody] Employee login)
        {
            var employee_ = _context.Employees.FirstOrDefault(e => e.Email == login.Email);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            if (employee_.Password != login.Password)
            {
                return BadRequest(new { message = "Incorrect password" });
            }

            return Ok(new { message = "Login successful", userId = employee_.UserId, email = employee_.Email, role = employee_.Role });
        }

        [HttpPost] //post
        public IActionResult Register([FromBody] Employee newEmployee)
        {
            if (_context.Employees.Any(e => e.Email == newEmployee.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            _context.Employees.Add(newEmployee);
            _context.SaveChanges();
            return Ok(newEmployee);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var employees = _context.Employees.ToList();
            return Ok(employees);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var employee_ = _context.Employees.Find(id);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            return Ok(employee_);
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] Employee updatedEmployee)
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

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var employee_ = _context.Employees.Find(id);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            _context.Employees.Remove(employee_);
            _context.SaveChanges();
            return Ok(new { message = "Employee deleted" });
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
