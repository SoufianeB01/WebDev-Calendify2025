using CalendifyWebAppAPI.Models;
using System.Collections.Generic;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomBookingService
    {
        RoomBooking BookRoom(RoomBooking booking);
        List<RoomBooking> GetUserBookings(int userId);
        RoomBooking? UpdateBooking(int roomId, int userId, RoomBooking updated);
        bool DeleteBooking(int roomId, int userId, System.DateTime bookingDate, System.TimeSpan startTime);
    }
}
