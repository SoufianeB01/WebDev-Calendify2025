using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace CalendifyWebAppAPI.Data
{
    public static class DbSeed
    {
        public static void Seed(AppDbContext context, IPasswordHasher<Employee> passwordHasher)
        {
            context.Database.EnsureCreated();

            if (!context.Employees.Any())
            {
                var user1 = new Employee
                {
                    Name = "User One",
                    Email = "user1@example.com",
                    Role = "User"
                };

                var user2 = new Employee
                {
                    Name = "User Two",
                    Email = "user2@example.com",
                    Role = "User"
                };

                var admin1 = new Employee
                {
                    Name = "Admin One",
                    Email = "admin1@example.com",
                    Role = "Admin"
                };

                var admin2 = new Employee
                {
                    Name = "Admin Two",
                    Email = "admin2@example.com",
                    Role = "Admin"
                };

                
                context.Employees.AddRange(user1, user2, admin1, admin2);
                context.SaveChanges();

                if (!context.Admins.Any())
                {
                    var admin1 = new Admin { UserId = user1.UserId, Permissions = "Full" };
                    var admin2 = new Admin { UserId = user2.UserId, Permissions = "Limited" };

                    context.Admins.AddRange(admin1, admin2);
                    context.SaveChanges();
                }
            }
        }
    }
}
