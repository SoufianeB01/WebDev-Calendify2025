using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        private bool IsAdmin()
        {
            var role = HttpContext.Session.GetString("UserRole");
            return role == "Admin";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admins = await _adminService.GetAllAdminsAsync();
            return Ok(admins);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admin_ = await _adminService.GetAdminByIdAsync(id);
            if (admin_ == null)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(admin_);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admin_ = await _adminService.GetAdminByUserIdAsync(userId);
            if (admin_ == null)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(admin_);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Admin admin)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var result = await _adminService.CreateAdminAsync(admin);
            if (!result.success)
            {
                return BadRequest(new { message = result.error });
            }
            return Ok(result.admin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Admin updated)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var result = await _adminService.UpdateAdminAsync(id, updated);
            if (!result.success)
            {
                return BadRequest(new { message = result.error });
            }
            return Ok(result.admin);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var success = await _adminService.DeleteAdminAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(new { message = "Deleted" });
        }
    }
}
