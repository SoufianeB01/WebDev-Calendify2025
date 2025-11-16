using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAuthService
    {
        string HashPassword(Employee user, string password);
        bool VerifyPassword(Employee user, string hashedPassword, string providedPassword);
    }
}


