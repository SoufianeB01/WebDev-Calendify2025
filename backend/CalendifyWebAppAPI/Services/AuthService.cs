using System.Linq;
using System.Threading.Tasks;
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
            // Simple async facade
            return await Task.Run(() =>
            {
                var employee = _context.Employees.FirstOrDefault(e => e.Email == email);
                if (employee == null)
                {
                    return (false, "Employee not found", null, false);
                }

                var verifyResult = _passwordHasher.VerifyHashedPassword(employee, employee.Password, password);
                if (verifyResult == PasswordVerificationResult.Failed)
                {
                    return (false, "Incorrect password", null, false);
                }

                var isAdmin = _context.Admins.Any(a => a.UserId == employee.UserId);
                if (!isAdmin)
                {
                    return (false, "User is not an admin", null, false);
                }

                return (true, string.Empty, employee, true);
            });
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

