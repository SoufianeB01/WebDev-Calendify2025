using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IUserService
    {
        Employee Register(Employee newEmployee);
        Employee? FindByEmail(string email);
        (bool success, Employee? user, string? error) Login(string email, string password);
        IEnumerable<Employee> GetAll();
    }
}


