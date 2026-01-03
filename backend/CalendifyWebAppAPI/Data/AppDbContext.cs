using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EventParticipation> EventParticipations { get; set; }
        public DbSet<OfficeAttendance> OfficeAttendances { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomBooking> RoomBookings { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<EventReview> EventReviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employee>().ToTable("employees");
            modelBuilder.Entity<Event>().ToTable("events");
            modelBuilder.Entity<Room>().ToTable("rooms");
            modelBuilder.Entity<Group>().ToTable("groups");
            modelBuilder.Entity<Admin>().ToTable("admins");
            modelBuilder.Entity<RoomBooking>().ToTable("roombookings");
            modelBuilder.Entity<EventParticipation>().ToTable("eventparticipations");
            modelBuilder.Entity<GroupMembership>().ToTable("groupmemberships");
            modelBuilder.Entity<OfficeAttendance>().ToTable("officeattendances");
            modelBuilder.Entity<EventReview>().ToTable("eventreviews");

            // EventParticipation composite key
            modelBuilder.Entity<EventParticipation>(eventParticipation =>
            {
                eventParticipation.HasKey(x => new { x.UserId, x.EventId });
                eventParticipation.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
                eventParticipation.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(x => x.EventId);
            });

            // EventReview
            modelBuilder.Entity<EventReview>(review =>
            {
                review.HasKey(x => x.ReviewId);
                review.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(x => x.EventId);
                review.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);

                // GUID PK
                review.Property(x => x.ReviewId)
                      .ValueGeneratedNever();
            });

            // OfficeAttendance
            modelBuilder.Entity<OfficeAttendance>(officeAttendance =>
            {
                officeAttendance.HasKey(x => x.AttendanceId);
                officeAttendance.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);

                // GUID PK
                officeAttendance.Property(x => x.AttendanceId)
                               .ValueGeneratedNever();
            });

            // RoomBooking composite key
            modelBuilder.Entity<RoomBooking>(roomBooking =>
            {
                roomBooking.HasKey(x => new { x.RoomId, x.UserId, x.BookingDate, x.StartTime });
                roomBooking.HasOne<Room>()
                    .WithMany()
                    .HasForeignKey(x => x.RoomId);
                roomBooking.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
            });

            // GroupMembership composite key
            modelBuilder.Entity<GroupMembership>(groupMembership =>
            {
                groupMembership.HasKey(x => new { x.UserId, x.GroupId });
                groupMembership.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
                groupMembership.HasOne<Group>()
                    .WithMany()
                    .HasForeignKey(x => x.GroupId);
            });

            // Admin
            modelBuilder.Entity<Admin>(admin =>
            {
                admin.HasKey(x => x.AdminId);
                admin.Property(x => x.AdminId).ValueGeneratedNever();
                admin.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Event
            modelBuilder.Entity<Event>(eventEntity =>
            {
                eventEntity.HasKey(x => x.EventId);
                eventEntity.Property(x => x.EventId).ValueGeneratedNever();
                eventEntity.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.CreatedBy);
            });

            // Room
            modelBuilder.Entity<Room>(room =>
            {
                room.HasKey(x => x.RoomId);
                room.Property(x => x.RoomId).ValueGeneratedNever();
            });

            // Group
            modelBuilder.Entity<Group>(group =>
            {
                group.HasKey(x => x.GroupId);
                group.Property(x => x.GroupId).ValueGeneratedNever();
            });

            // Employee
            modelBuilder.Entity<Employee>(employee =>
            {
                employee.HasKey(x => x.UserId);
                employee.Property(x => x.UserId).ValueGeneratedNever();
            });
        }
    }
}
