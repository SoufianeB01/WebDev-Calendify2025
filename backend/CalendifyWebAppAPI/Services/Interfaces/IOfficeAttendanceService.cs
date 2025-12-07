using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Models.DTOs;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IOfficeAttendanceService
    {
        Task<(bool success, string error, OfficeAttendance? attendance)> CreateAsync(OfficeAttendanceRequest req);
        Task<(bool success, string error, OfficeAttendance? attendance)> UpdateAsync(int attendanceId, OfficeAttendanceRequest req);
    }
}
