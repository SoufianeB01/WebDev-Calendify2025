using System;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task<OfficeAttendance?> AddAttendanceAsync(OfficeAttendance attendance);
        Task<List<OfficeAttendance>> GetUserAttendancesAsync(Guid userId);
        Task<OfficeAttendance?> UpdateAttendanceAsync(Guid id, OfficeAttendance updated);
        Task<bool> DeleteAttendanceAsync(Guid id);
    }
}
