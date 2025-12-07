using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace CalendifyWebAppAPI.Services
{
    public class AdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public List<Admin> GetAllAdmins()
        {
            return _context.Admins.ToList();
        }

        public Admin? GetAdminById(int id)
        {
            return _context.Admins.FirstOrDefault(a => a.AdminId == id);
        }

        public Admin? GetAdminByUserId(int userId)
        {
            return _context.Admins.FirstOrDefault(a => a.UserId == userId);
        }

        public (bool success, string error, Admin? admin) CreateAdmin(Admin admin)
        {
            if (_context.Admins.Any(a => a.UserId == admin.UserId))
                return (false, "Admin already exists", null);

            _context.Admins.Add(admin);
            _context.SaveChanges();
            return (true, "", admin);
        }

        public (bool success, string error, Admin? admin) UpdateAdmin(int id, Admin updated)
        {
            var existing = _context.Admins.Find(id);
            if (existing == null) return (false, "Admin not found", null);

            existing.UserId = updated.UserId;
            existing.Permissions = updated.Permissions;
            _context.SaveChanges();
            return (true, "", existing);
        }

        public bool DeleteAdmin(int id)
        {
            var existing = _context.Admins.Find(id);
            if (existing == null) return false;

            _context.Admins.Remove(existing);
            _context.SaveChanges();
            return true;
        }
    }
}