using CalendifyWebAppAPI.Models;
using System.Collections.Generic;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAttendanceService
    {
        OfficeAttendance AddAttendance(OfficeAttendance attendance);
        List<OfficeAttendance> GetUserAttendances(int userId);
        OfficeAttendance? UpdateAttendance(int id, OfficeAttendance updated);
        bool DeleteAttendance(int id);
    }
}
