using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;


namespace CalendifyWebAppAPI.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _context;

        public EmployeeService(AppDbContext context)
        {
            _context = context;
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
                emp.Password = updated.Password;

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
