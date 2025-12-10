using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task<OfficeAttendance?> AddAttendanceAsync(OfficeAttendance attendance);
        Task<List<OfficeAttendance>> GetUserAttendancesAsync(int userId);
        Task<OfficeAttendance?> UpdateAttendanceAsync(int id, OfficeAttendance updated);
        Task<bool> DeleteAttendanceAsync(int id);
    }
}
