using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        private readonly IAuthService _auth;

        public UserService(AppDbContext db, IAuthService auth)
        {
            _db = db;
            _auth = auth;
        }

        public IEnumerable<Employee> GetAll()
        {
            return _db.Employees.AsNoTracking().ToList();
        }

        public Employee? FindByEmail(string email)
        {
            return _db.Employees.FirstOrDefault(e => e.Email == email);
        }

        public Employee Register(Employee newEmployee)
        {
            if (_db.Employees.Any(e => e.Email == newEmployee.Email))
            {
                throw new InvalidOperationException("Email already exists");
            }

            // Hash password on create
            var hashed = _auth.HashPassword(newEmployee, newEmployee.Password);
            newEmployee.Password = hashed;

            _db.Employees.Add(newEmployee);
            _db.SaveChanges();
            return newEmployee;
        }

        public (bool success, Employee? user, string? error) Login(string email, string password)
        {
            var user = FindByEmail(email);
            if (user == null)
            {
                return (false, null, "Employee not found");
            }

            var ok = _auth.VerifyPassword(user, user.Password, password);
            if (!ok)
            {
                return (false, null, "Incorrect password");
            }

            return (true, user, null);
        }
    }
}


