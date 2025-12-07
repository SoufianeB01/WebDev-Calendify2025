using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminsController : GenericCrudController<Admin, int>
    {
        private readonly IAuthService _auth;

        public AdminsController(AppDbContext context, IAuthService auth) : base(context)
        {
            _auth = auth;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Employee req)
        {
            var (success, error, employee, isAdmin) = await _auth.ValidateCredentialsAsync(req.Email, req.Password);
            if (!success) return BadRequest(new { message = error });
            if (!isAdmin) return Unauthorized(new { message = "Admin privileges required" });

            HttpContext.Session.SetInt32("UserId", employee!.UserId);
            HttpContext.Session.SetString("UserRole", "Admin");
            HttpContext.Session.SetString("UserName", employee.Name);

            return Ok(new { success = true, userId = employee.UserId, name = employee.Name, role = "Admin" });
        }

        [HttpGet("status")]
        public IActionResult Status()
        {
            var uid = HttpContext.Session.GetInt32("UserId");
            var role = HttpContext.Session.GetString("UserRole");
            var name = HttpContext.Session.GetString("UserName");
            var loggedIn = uid != null && role == "Admin";
            return Ok(new { loggedIn, name = loggedIn ? name : null });
        }

        [HttpPost]
        public override async Task<IActionResult> Create([FromBody] Admin admin)
        {
            var user = await _context.Employees.FindAsync(admin.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == admin.UserId);
            if (existingAdmin != null)
            {
                return BadRequest(new { message = "User is already an admin" });
            }

            await _context.Admins.AddAsync(admin);
            await _context.SaveChangesAsync();
            return Ok(admin);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            return Ok(admin);
        }

        [HttpGet("{id}/permissions")]
        public async Task<IActionResult> GetPermissions(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            return Ok(new { permissions = admin.Permissions });
        }

        [HttpPut("{id}")]
        public override async Task<IActionResult> Update(int id, [FromBody] Admin updated)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            admin.UserId = updated.UserId;
            admin.Permissions = updated.Permissions;
            await _context.SaveChangesAsync();
            return Ok(admin);
        }
    }
}

