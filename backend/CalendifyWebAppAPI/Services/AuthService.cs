using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CalendifyWebAppAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IPasswordHasher<Employee> _passwordHasher;

        public AuthService(IPasswordHasher<Employee> passwordHasher)
        {
            _passwordHasher = passwordHasher;
        }

        public string HashPassword(Employee user, string password)
        {
            return _passwordHasher.HashPassword(user, password);
        }

        public bool VerifyPassword(Employee user, string hashedPassword, string providedPassword)
        {
            var looksHashed = !string.IsNullOrWhiteSpace(hashedPassword) && hashedPassword.StartsWith("AQAAAA");
            if (!looksHashed)
            {
                return string.Equals(hashedPassword, providedPassword);
            }

            var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
            return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
        }
    }
}


