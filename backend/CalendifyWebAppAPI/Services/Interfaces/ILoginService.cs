using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Http;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface ILoginService
    {
        Task<(bool success, string error, Employee? employee)> LoginAsync(string email, string password);
        Task<(bool success, string error)> RegisterAsync(Employee employee);
        Task<(bool isLoggedIn, string? name, string? role)> GetSessionInfoAsync(HttpContext httpContext);
        Task LogoutAsync(HttpContext httpContext);
    }
}
