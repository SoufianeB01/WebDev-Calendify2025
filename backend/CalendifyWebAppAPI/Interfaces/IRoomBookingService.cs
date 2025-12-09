using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomBookingService
    {
        Task<RoomBooking?> BookRoomAsync(RoomBooking booking);
        Task<List<RoomBooking>> GetUserBookingsAsync(int userId);
        Task<RoomBooking?> UpdateBookingAsync(int roomId, int userId, RoomBooking updated);
        Task<bool> DeleteBookingAsync(int roomId, int userId, System.DateTime bookingDate, System.TimeSpan startTime);
    }
}
