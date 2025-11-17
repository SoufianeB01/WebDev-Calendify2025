using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomBookingService
    {
        RoomBooking Create(RoomBooking booking);
        RoomBooking? Update(RoomBooking updated);
        bool Delete(int roomId, int userId, DateTime bookingDate, TimeSpan startTime);
        IEnumerable<RoomBooking> GetAll();
        IEnumerable<RoomBooking> GetByRoomId(int roomId);
        IEnumerable<RoomBooking> GetByUserId(int userId);
        bool IsRoomAvailable(int roomId, DateTime bookingDate, TimeSpan startTime, TimeSpan endTime);
    }
}


