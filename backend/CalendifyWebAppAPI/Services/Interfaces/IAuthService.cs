using System.Threading.Tasks;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<(bool success, string error, Employee? employee, bool isAdmin)> ValidateCredentialsAsync(string email, string password);
        string HashPassword(Employee employee, string password);
        bool VerifyPassword(Employee employee, string password, string hashedPassword);
    }
}

