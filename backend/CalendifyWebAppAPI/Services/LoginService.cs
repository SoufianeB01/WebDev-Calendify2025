using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace CalendifyWebAppAPI.Services
{
    // Uses password hasher to match your existing Employee storage
    public class LoginService : ILoginService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<Employee> _passwordHasher;

        public LoginService(AppDbContext context, IPasswordHasher<Employee> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<(bool success, string error, Employee? employee)> LoginAsync(string email, string password)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (employee == null) return (false, "User not found", null);

            var result = _passwordHasher.VerifyHashedPassword(employee, employee.Password, password);
            if (result == PasswordVerificationResult.Failed)
                return (false, "Invalid credentials", null);

            return (true, string.Empty, employee);
        }

        public async Task<(bool success, string error)> RegisterAsync(Employee employee)
        {
            var exists = await _context.Employees.AnyAsync(e => e.Email == employee.Email);
            if (exists) return (false, "Email already registered");

            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }

        public Task<(bool isLoggedIn, string? name, string? role)> GetSessionInfoAsync(HttpContext httpContext)
        {
            var userId = httpContext.Session.GetInt32("UserId");
            if (userId == null) return Task.FromResult((false, (string?)null, (string?)null));
            var userName = httpContext.Session.GetString("UserName");
            var userRole = httpContext.Session.GetString("UserRole");
            return Task.FromResult((true, userName, userRole));
        }

        public Task LogoutAsync(HttpContext httpContext)
        {
            httpContext.Session.Remove("UserId");
            httpContext.Session.Remove("UserName");
            httpContext.Session.Remove("UserRole");
            return Task.CompletedTask;
        }
    }
}
