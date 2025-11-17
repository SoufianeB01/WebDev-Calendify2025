using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1:3000",
                "https://127.0.0.1:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

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

// Apply CORS before endpoints
app.UseCors("Dev");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
