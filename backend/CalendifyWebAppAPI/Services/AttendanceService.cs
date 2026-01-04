using System;
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
            var exists = await _context.OfficeAttendances
                .AnyAsync(a =>
                    a.UserId == attendance.UserId &&
                    a.Date.Date == attendance.Date.Date
                );

            if (exists) return null;

            _context.OfficeAttendances.Add(attendance);
            await _context.SaveChangesAsync();
            return attendance;
        }

        public async Task<List<OfficeAttendance>> GetUserAttendancesAsync(Guid userId)
        {
            return await _context.OfficeAttendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        public async Task<bool> DeleteAttendanceAsync(Guid id)
        {
            var existing = await _context.OfficeAttendances.FindAsync(id);
            if (existing == null) return false;

            _context.OfficeAttendances.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
