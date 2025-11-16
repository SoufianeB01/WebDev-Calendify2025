using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _db;

        public AttendanceService(AppDbContext db)
        {
            _db = db;
        }

        public OfficeAttendance Create(OfficeAttendance attendance)
        {
            if (_db.Employees.Find(attendance.UserId) == null)
                throw new InvalidOperationException("User not found");
            attendance.Date = DateTime.SpecifyKind(attendance.Date, DateTimeKind.Utc);
            _db.OfficeAttendances.Add(attendance);
            _db.SaveChanges();
            return attendance;
        }

        public OfficeAttendance? Update(int attendanceId, OfficeAttendance updated)
        {
            var found = _db.OfficeAttendances.Find(attendanceId);
            if (found == null) return null;
            found.UserId = updated.UserId;
            found.Date = DateTime.SpecifyKind(updated.Date, DateTimeKind.Utc);
            found.Status = updated.Status;
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int attendanceId)
        {
            var found = _db.OfficeAttendances.Find(attendanceId);
            if (found == null) return false;
            _db.OfficeAttendances.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public OfficeAttendance? GetById(int attendanceId) => _db.OfficeAttendances.Find(attendanceId);
        public IEnumerable<OfficeAttendance> GetAll() => _db.OfficeAttendances.AsNoTracking().ToList();
        public IEnumerable<OfficeAttendance> GetByUserId(int userId) =>
            _db.OfficeAttendances.AsNoTracking().Where(a => a.UserId == userId).OrderByDescending(a => a.Date).ToList();
        public IEnumerable<OfficeAttendance> GetByDate(DateTime date) =>
            _db.OfficeAttendances.AsNoTracking().Where(a => a.Date.Date == date.Date).ToList();
    }
}


