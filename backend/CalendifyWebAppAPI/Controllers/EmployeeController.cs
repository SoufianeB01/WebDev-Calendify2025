using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _employeeService;

        public EmployeesController(EmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!Guid.TryParse(id, out Guid userId))
                return BadRequest(new { message = "Invalid ID" });

            var employee = await _employeeService.GetEmployeeByIdAsync(userId);
            if (employee == null) return NotFound();

            return Ok(employee);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Employee employee)
        {
            employee.UserId = Guid.NewGuid();
            var created = await _employeeService.CreateEmployeeAsync(employee);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Employee updated)
        {
            if (!Guid.TryParse(id, out Guid userId))
                return BadRequest(new { message = "Invalid ID" });

            var employee = await _employeeService.UpdateEmployeeAsync(userId, updated);
            if (employee == null) return NotFound();
            return Ok(employee);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!Guid.TryParse(id, out Guid userId))
                return BadRequest(new { message = "Invalid ID" });

            var success = await _employeeService.DeleteEmployeeAsync(userId);
            if (!success) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}
