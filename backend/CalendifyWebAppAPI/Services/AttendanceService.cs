using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;

namespace CalendifyWebAppAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _context;

        public AttendanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<OfficeAttendance?> AddAttendanceAsync(OfficeAttendance attendance)
        {
            var exists = await _context.OfficeAttendances.FirstOrDefaultAsync(a => a.UserId == attendance.UserId && a.Date == attendance.Date);
            if (exists != null) return null;

            _context.OfficeAttendances.Add(attendance);
            await _context.SaveChangesAsync();
            return attendance;
        }

        public async Task<List<OfficeAttendance>> GetUserAttendancesAsync(int userId)
        {
            return await _context.OfficeAttendances.Where(a => a.UserId == userId).ToListAsync();
        }

        public async Task<OfficeAttendance?> UpdateAttendanceAsync(int id, OfficeAttendance updated)
        {
            var existing = await _context.OfficeAttendances.FindAsync(id);
            if (existing == null)
            {
                return null;
            }

            existing.Date = updated.Date;
            existing.Status = updated.Status;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAttendanceAsync(int id)
        {
            var existing = await _context.OfficeAttendances.FindAsync(id);
            if (existing == null) return false;

            _context.OfficeAttendances.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}