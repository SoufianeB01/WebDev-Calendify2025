using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// Add services
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<CalendifyWebAppAPI.Models.Employee>, Microsoft.AspNetCore.Identity.PasswordHasher<CalendifyWebAppAPI.Models.Employee>>();
builder.Services.AddScoped<CalendifyWebAppAPI.Services.Interfaces.IAuthService, CalendifyWebAppAPI.Services.AuthService>();
builder.Services.AddScoped<CalendifyWebAppAPI.Services.Interfaces.IUserService, CalendifyWebAppAPI.Services.UserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
