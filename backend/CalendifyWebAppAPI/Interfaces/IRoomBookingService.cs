using System;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomBookingService
    {
        Task<RoomBooking?> BookRoomAsync(RoomBooking booking);
        Task<List<RoomBooking>> GetUserBookingsAsync(Guid userId);
        Task<RoomBooking?> UpdateBookingAsync(Guid roomId, Guid userId, RoomBooking updated);
        Task<bool> DeleteBookingAsync(Guid roomId, Guid userId, System.DateTime bookingDate, System.TimeSpan startTime);
    }
}
