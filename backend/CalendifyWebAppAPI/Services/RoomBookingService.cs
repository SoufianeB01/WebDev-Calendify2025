using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class RoomBookingService : IRoomBookingService
    {
        private readonly AppDbContext _db;

        public RoomBookingService(AppDbContext db)
        {
            _db = db;
        }

        public RoomBooking Create(RoomBooking booking)
        {
            if (_db.Rooms.Find(booking.RoomId) == null)
                throw new InvalidOperationException("Room not found");
            if (_db.Employees.Find(booking.UserId) == null)
                throw new InvalidOperationException("User not found");

            if (!IsRoomAvailable(booking.RoomId, booking.BookingDate, booking.StartTime, booking.EndTime))
                throw new InvalidOperationException("Room is already booked for this time slot");

            booking.BookingDate = DateTime.SpecifyKind(booking.BookingDate, DateTimeKind.Utc);
            _db.RoomBookings.Add(booking);
            _db.SaveChanges();
            return booking;
        }

        public RoomBooking? Update(RoomBooking updated)
        {
            var found = _db.RoomBookings.FirstOrDefault(b =>
                b.RoomId == updated.RoomId &&
                b.UserId == updated.UserId &&
                b.BookingDate.Date == updated.BookingDate.Date &&
                b.StartTime == updated.StartTime);
            if (found == null) return null;

            if (!IsRoomAvailable(updated.RoomId, updated.BookingDate, updated.StartTime, updated.EndTime))
                throw new InvalidOperationException("Room is already booked for this time slot");

            found.EndTime = updated.EndTime;
            found.Purpose = updated.Purpose;
            found.BookingDate = DateTime.SpecifyKind(updated.BookingDate, DateTimeKind.Utc);
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int roomId, int userId, DateTime bookingDate, TimeSpan startTime)
        {
            var found = _db.RoomBookings.FirstOrDefault(b =>
                b.RoomId == roomId &&
                b.UserId == userId &&
                b.BookingDate.Date == bookingDate.Date &&
                b.StartTime == startTime);
            if (found == null) return false;
            _db.RoomBookings.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public IEnumerable<RoomBooking> GetAll() => _db.RoomBookings.AsNoTracking().ToList();
        public IEnumerable<RoomBooking> GetByRoomId(int roomId) =>
            _db.RoomBookings.AsNoTracking().Where(b => b.RoomId == roomId).ToList();
        public IEnumerable<RoomBooking> GetByUserId(int userId) =>
            _db.RoomBookings.AsNoTracking().Where(b => b.UserId == userId).ToList();

        public bool IsRoomAvailable(int roomId, DateTime bookingDate, TimeSpan startTime, TimeSpan endTime)
        {
            var conflict = _db.RoomBookings.FirstOrDefault(b =>
                b.RoomId == roomId &&
                b.BookingDate.Date == bookingDate.Date &&
                ((b.StartTime <= startTime && b.EndTime > startTime) ||
                 (b.StartTime < endTime && b.EndTime >= endTime) ||
                 (b.StartTime >= startTime && b.EndTime <= endTime)));
            return conflict == null;
        }
    }
}


