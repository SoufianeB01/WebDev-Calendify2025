using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using CalendifyWebAppAPI.Services;
using CalendifyWebAppAPI.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Simple .env loader to avoid missing 'Env' symbol
void LoadEnv(string path)
{
    if (!File.Exists(path)) return;
    foreach (var raw in File.ReadAllLines(path))
    {
        var line = raw.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var idx = line.IndexOf('=');
        if (idx <= 0) continue;
        var key = line.Substring(0, idx).Trim();
        var val = line.Substring(idx + 1).Trim().Trim('"');
        Environment.SetEnvironmentVariable(key, val);
    }
}
LoadEnv(Path.Combine(builder.Environment.ContentRootPath, "..", ".env"));
LoadEnv(Path.Combine(builder.Environment.ContentRootPath, ".env"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".Calendify.Session";
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.None
        : CookieSecurePolicy.Always;
});

var frontendOrigin = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ?? "http://localhost:3000";

builder.Services.AddCors(o =>
{
    o.AddPolicy("Dev", p =>
        p.WithOrigins(frontendOrigin)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddScoped<IPasswordHasher<CalendifyWebAppAPI.Models.Employee>, PasswordHasher<CalendifyWebAppAPI.Models.Employee>>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEventAttendanceService, EventAttendanceService>();
builder.Services.AddScoped<IOfficeAttendanceService, OfficeAttendanceService>();
builder.Services.AddScoped<IRoomBookingService, RoomBookingService>();
// New service registrations
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IEventService, EventService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Dev");
app.UseSession();
app.UseMiddleware<CalendifyWebAppAPI.Middleware.SessionMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.Run();
