using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomBookingService
    {
        Task<(bool success, string error, RoomBooking? booking)> CreateAsync(RoomBooking booking);
        Task<(bool success, string error)> CancelAsync(int roomId, int userId, DateOnly bookingDate, TimeOnly startTime);
        Task<List<RoomBooking>> GetByRoomAndDateAsync(int roomId, DateOnly bookingDate);
        Task<bool> IsSlotAvailableAsync(int roomId, DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime);
    }
}
