using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _db;

        public AdminService(AppDbContext db)
        {
            _db = db;
        }

        public Admin Create(Admin admin)
        {
            if (_db.Employees.Find(admin.UserId) == null)
                throw new InvalidOperationException("User not found");
            if (_db.Admins.FirstOrDefault(a => a.UserId == admin.UserId) != null)
                throw new InvalidOperationException("User is already an admin");
            _db.Admins.Add(admin);
            _db.SaveChanges();
            return admin;
        }

        public Admin? Update(int adminId, Admin updated)
        {
            var found = _db.Admins.Find(adminId);
            if (found == null) return null;
            found.UserId = updated.UserId;
            found.Permissions = updated.Permissions;
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int adminId)
        {
            var found = _db.Admins.Find(adminId);
            if (found == null) return false;
            _db.Admins.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public Admin? GetById(int adminId) => _db.Admins.Find(adminId);
        public Admin? GetByUserId(int userId) => _db.Admins.FirstOrDefault(a => a.UserId == userId);
        public IEnumerable<Admin> GetAll() => _db.Admins.AsNoTracking().ToList();
    }
}


