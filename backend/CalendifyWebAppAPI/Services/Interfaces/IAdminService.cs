using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAdminService
    {
        Admin Create(Admin admin);
        Admin? Update(int adminId, Admin updated);
        bool Delete(int adminId);
        Admin? GetById(int adminId);
        Admin? GetByUserId(int userId);
        IEnumerable<Admin> GetAll();
    }
}


