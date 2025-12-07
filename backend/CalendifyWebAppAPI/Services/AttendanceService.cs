using System.Linq;
using System.Collections.Generic;
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

        public OfficeAttendance AddAttendance(OfficeAttendance attendance)
        {
            var exists = _context.OfficeAttendances.FirstOrDefault(a => a.UserId == attendance.UserId && a.Date == attendance.Date);
            if (exists != null) return null;

            _context.OfficeAttendances.Add(attendance);
            _context.SaveChanges();
            return attendance;
        }

        public List<OfficeAttendance> GetUserAttendances(int userId)
        {
            return _context.OfficeAttendances.Where(a => a.UserId == userId).ToList();
        }

        public OfficeAttendance? UpdateAttendance(int id, OfficeAttendance updated)
        {
            var existing = _context.OfficeAttendances.Find(id);
            if (existing == null)
            {
                return null;
            }

            existing.Date = updated.Date;
            existing.Status = updated.Status;
            _context.SaveChanges();
            return existing;
        }

        public bool DeleteAttendance(int id)
        {
            var existing = _context.OfficeAttendances.Find(id);
            if (existing == null) return false;

            _context.OfficeAttendances.Remove(existing);
            _context.SaveChanges();
            return true;
        }
    }
}