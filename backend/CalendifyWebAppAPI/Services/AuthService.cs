using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CalendifyWebAppAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<Employee> _passwordHasher;

        public AuthService(AppDbContext context, IPasswordHasher<Employee> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<(bool success, string error, Employee? employee, bool isAdmin)> ValidateCredentialsAsync(string email, string password)
        {
            var employee_ = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (employee_ == null)
            {
                return (false, "Employee not found", null, false);
            }

            var verify = _passwordHasher.VerifyHashedPassword(employee_, employee_.Password, password);
            if (verify == PasswordVerificationResult.Failed)
            {
                return (false, "Incorrect password", null, false);
            }

            var isAdmin = await _context.Admins.AnyAsync(a => a.UserId == employee_.UserId);
            return (true, string.Empty, employee_, isAdmin);
        }

        public string HashPassword(Employee employee, string password)
        {
            return _passwordHasher.HashPassword(employee, password);
        }

        public bool VerifyPassword(Employee employee, string password, string hashedPassword)
        {
            var result = _passwordHasher.VerifyHashedPassword(employee, hashedPassword, password);
            return result != PasswordVerificationResult.Failed;
        }
    }
}
