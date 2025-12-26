using System;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class AdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Admin>> GetAllAdminsAsync()
        {
            return await _context.Admins.ToListAsync();
        }

        public async Task<Admin?> GetAdminByIdAsync(Guid id)
        {
            return await _context.Admins.FirstOrDefaultAsync(a => a.AdminId == id);
        }

        public async Task<Admin?> GetAdminByUserIdAsync(Guid userId)
        {
            return await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
        }

        public async Task<(bool success, string error, Admin? admin)> CreateAdminAsync(Admin admin)
        {
            if (await _context.Admins.AnyAsync(a => a.UserId == admin.UserId))
                return (false, "Admin already exists", null);

            if (admin.AdminId == Guid.Empty)
                admin.AdminId = Guid.NewGuid();
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return (true, "", admin);
        }

        public async Task<(bool success, string error, Admin? admin)> UpdateAdminAsync(Guid id, Admin updated)
        {
            var existing = await _context.Admins.FindAsync(id);
            if (existing == null) return (false, "Admin not found", null);

            existing.UserId = updated.UserId;
            existing.Permissions = updated.Permissions;
            await _context.SaveChangesAsync();
            return (true, "", existing);
        }

        public async Task<bool> DeleteAdminAsync(Guid id)
        {
            var existing = await _context.Admins.FindAsync(id);
            if (existing == null) return false;

            _context.Admins.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}