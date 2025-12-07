using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : GenericCrudController<Employee, int>
    {
        private readonly IPasswordHasher<Employee> _passwordHasher;
        private readonly IAuthService _auth;
        private readonly ILoginService _loginService;

        public UserController(AppDbContext context, IPasswordHasher<Employee> passwordHasher, IAuthService auth, ILoginService loginService) : base(context)
        {
            _passwordHasher = passwordHasher;
            _auth = auth;
            _loginService = loginService;
        }

        // User registration (POST)
        [HttpPost("register")]
        public async Task<IActionResult> Register([Bind("Name,Email,Role,Password")] Employee req)
        {
            if (await _context.Employees.AnyAsync(e => e.Email == req.Email))
                return BadRequest(new { message = "Email already exists" });

            var emp = new Employee
            {
                Name = req.Name,
                Email = req.Email,
                Role = string.IsNullOrWhiteSpace(req.Role) ? "User" : req.Role,
                Password = ""
            };
            emp.Password = _passwordHasher.HashPassword(emp, req.Password);

            await _context.Employees.AddAsync(emp);
            await _context.SaveChangesAsync();

            return Ok(new { userId = emp.UserId, name = emp.Name, email = emp.Email, role = emp.Role });
        }

        // User login (POST)
        [HttpPost("login")]
        public async Task<IActionResult> Login([Bind("Email,Password")] Employee req)
        {
            var (success, error, employee, isAdmin) = await _auth.ValidateCredentialsAsync(req.Email, req.Password);
            if (!success) return BadRequest(new { message = error });

            HttpContext.Session.SetInt32("UserId", employee!.UserId);
            HttpContext.Session.SetString("UserRole", isAdmin ? "Admin" : "User");
            HttpContext.Session.SetString("UserName", employee.Name);

            return Ok(new { success = true, userId = employee.UserId, name = employee.Name, role = isAdmin ? "Admin" : "User" });
        }

        // Status (GET)
        [HttpGet("status")]
        public IActionResult Status()
        {
            var uid = HttpContext.Session.GetInt32("UserId");
            var role = HttpContext.Session.GetString("UserRole");
            var name = HttpContext.Session.GetString("UserName");
            return Ok(new { loggedIn = uid != null, name, role });
        }

        [HttpPost] //post
        public override async Task<IActionResult> Create([Bind("Name,Email,Role,Password")] Employee newEmployee)
        {
            if (await _context.Employees.AnyAsync(e => e.Email == newEmployee.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            newEmployee.Password = _passwordHasher.HashPassword(newEmployee, newEmployee.Password);
            await _context.Employees.AddAsync(newEmployee);
            await _context.SaveChangesAsync();
            // Never return password
            newEmployee.Password = "";
            return Ok(new { userId = newEmployee.UserId, name = newEmployee.Name, email = newEmployee.Email, role = newEmployee.Role });
        }

        [HttpPut("{id}")] //put
        public override async Task<IActionResult> Update(int id, [Bind("Name,Email,Role,Password")] Employee updatedEmployee)
        {
            var employee_ = await _context.Employees.FindAsync(id);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            // Check if email already exists for another user
            if (updatedEmployee.Email != employee_.Email &&
                await _context.Employees.AnyAsync(e => e.Email == updatedEmployee.Email && e.UserId != id))
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

            await _context.SaveChangesAsync();
            return Ok(new { userId = employee_.UserId, name = employee_.Name, email = employee_.Email, role = employee_.Role });
        }

        [HttpGet("email/{email}")] //get
        public IActionResult GetByEmail(string email)
        {
            var employee_ = _context.Employees.FirstOrDefault(e => e.Email == email);
            if (employee_ == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            return Ok(new { userId = employee_.UserId, name = employee_.Name, email = employee_.Email, role = employee_.Role });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var id = HttpContext.Session.GetInt32("UserId");
            if (id == null) return Unauthorized(new { message = "No active session" });

            var emp = _context.Employees.Find(id.Value);
            if (emp == null) return Unauthorized(new { message = "No active session" });

            return Ok(new { userId = emp.UserId, name = emp.Name, email = emp.Email, role = HttpContext.Session.GetString("UserRole") ?? emp.Role });
        }

        [HttpPost("seed-test-users")]
        public IActionResult SeedTestUsers()
        {
            var seeds = new[]
            {
                new { Name = "Test User One",  Email = "test1@company.com", Role = "User",  Password = "test123" },
                new { Name = "Test User Two",  Email = "test2@company.com", Role = "User",  Password = "test123" },
                new { Name = "Test User Three",Email = "test3@company.com", Role = "Admin", Password = "test123" },
            };

            var results = new List<object>();

            foreach (var s in seeds)
            {
                var existing = _context.Employees.FirstOrDefault(e => e.Email == s.Email);
                if (existing != null)
                {
                    results.Add(new { email = s.Email, status = "exists", userId = existing.UserId });
                    continue;
                }

                var emp = new Employee
                {
                    Name = s.Name,
                    Email = s.Email,
                    Role = s.Role,
                    Password = "" // will be hashed below
                };
                emp.Password = _passwordHasher.HashPassword(emp, s.Password);

                _context.Employees.Add(emp);
                _context.SaveChanges();

                results.Add(new { email = s.Email, status = "created", userId = emp.UserId });
            }

            return Ok(results);
        }

        // Extra session info (alias of status)
        [HttpGet("session")]
        public async Task<IActionResult> SessionInfo()
        {
            var (isLoggedIn, name, role) = await _loginService.GetSessionInfoAsync(HttpContext);
            return Ok(new { isLoggedIn, name, role });
        }

        // Logout endpoint
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _loginService.LogoutAsync(HttpContext);
            return Ok(new { message = "Logged out" });
        }
    }
}
