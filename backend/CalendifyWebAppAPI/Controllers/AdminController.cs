using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services;
using Microsoft.AspNetCore.Mvc;

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
        public  IActionResult GetAll()
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admins = _adminService.GetAllAdmins();
            return Ok(admins);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admin_ = _adminService.GetAdminById(id);
            if (admin_ == null)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(admin_);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUserId(int userId)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var admin_ = _adminService.GetAdminByUserId(userId);
            if (admin_ == null)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(admin_);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Admin admin)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var result = _adminService.CreateAdmin(admin);
            if (!result.success)
            {
                return BadRequest(new { message = result.error });
            }
            return Ok(result.admin);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Admin updated)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var result = _adminService.UpdateAdmin(id, updated);
            if (!result.success)
            {
                return BadRequest(new { message = result.error });
            }
            return Ok(result.admin);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin required" });
            }
            var success = _adminService.DeleteAdmin(id);
            if (!success)
            {
                return NotFound(new { message = "Admin not found" });
            }
            return Ok(new { message = "Deleted" });
        }
    }
}
