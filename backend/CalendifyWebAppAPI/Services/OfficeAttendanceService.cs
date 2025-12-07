using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Models.DTOs;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class OfficeAttendanceService : IOfficeAttendanceService
    {
        private readonly AppDbContext _context;
        public OfficeAttendanceService(AppDbContext context) => _context = context;

        public async Task<(bool success, string error, OfficeAttendance? attendance)> CreateAsync(OfficeAttendanceRequest req)
        {
            var exists = await _context.OfficeAttendances
                .AnyAsync(a => a.UserId == req.UserId && a.Date == req.Date); // DateOnly == DateOnly (fixes CS0019)

            if (exists) return (false, "Date already occupied", null);

            var attendance = new OfficeAttendance
            {
                UserId = req.UserId,
                Date = req.Date,
                IsPresent = req.IsPresent
            };
            await _context.OfficeAttendances.AddAsync(attendance);
            await _context.SaveChangesAsync();
            return (true, string.Empty, attendance);
        }

        public async Task<(bool success, string error, OfficeAttendance? attendance)> UpdateAsync(int attendanceId, OfficeAttendanceRequest req)
        {
            var attendance = await _context.OfficeAttendances.FindAsync(attendanceId);
            if (attendance == null) return (false, "Attendance not found", null);
            if (attendance.UserId != req.UserId) return (false, "Forbidden", null);

            // Ensure not changing to an occupied date (other record at same date)
            var occupied = await _context.OfficeAttendances.AnyAsync(a =>
                a.UserId == req.UserId && a.Date == req.Date && a.AttendanceId != attendanceId);
            if (occupied) return (false, "Date already occupied", null);

            attendance.Date = req.Date;
            attendance.IsPresent = req.IsPresent;
            await _context.SaveChangesAsync();
            return (true, string.Empty, attendance);
        }
    }
}
