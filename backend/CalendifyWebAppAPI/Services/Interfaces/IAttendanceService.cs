using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAttendanceService
    {
        OfficeAttendance Create(OfficeAttendance attendance);
        OfficeAttendance? Update(int attendanceId, OfficeAttendance updated);
        bool Delete(int attendanceId);
        OfficeAttendance? GetById(int attendanceId);
        IEnumerable<OfficeAttendance> GetAll();
        IEnumerable<OfficeAttendance> GetByUserId(int userId);
        IEnumerable<OfficeAttendance> GetByDate(DateTime date);
    }
}


