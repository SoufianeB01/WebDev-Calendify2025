using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;


namespace CalendifyWebAppAPI.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;

        public EmployeeService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees.ToListAsync();
        }

        public async Task<Employee?> GetEmployeeByIdAsync(Guid userId)
        {
            return await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<Employee> CreateEmployeeAsync(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task<Employee?> UpdateEmployeeAsync(Guid userId, Employee updated)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return null;

            emp.Name = updated.Name;
            emp.Email = updated.Email;
            emp.Role = updated.Role;
            if (!string.IsNullOrEmpty(updated.Password))
                emp.Password = _authService.HashPassword(emp, updated.Password);

            await _context.SaveChangesAsync();
            return emp;
        }

        public async Task<bool> DeleteEmployeeAsync(Guid userId)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return false;

            _context.Employees.Remove(emp);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
