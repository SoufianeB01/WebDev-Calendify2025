using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using CalendifyWebAppAPI.Services;
using CalendifyWebAppAPI.Services.Interfaces;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;

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

    if (builder.Environment.IsDevelopment())
    {
        // For http://localhost:5143 during development
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    }
    else
    {
        // For production (https)
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    }
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
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IRoomBookingService, RoomBookingService>();
builder.Services.AddScoped<IEventParticipationService, EventParticipationService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<EmployeeService>();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var passwordHasher = services.GetRequiredService<IPasswordHasher<Employee>>();
    try
    {
        SeedData.Initialize(context, passwordHasher);
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"SeedData.Initialize failed: {ex.Message}");
    }
}

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

// Add routing before CORS/session/auth
app.UseRouting();

app.UseCors("Dev");
app.UseSession();
app.UseMiddleware<CalendifyWebAppAPI.Middleware.SessionMiddleware>();
app.UseAuthorization();

// Map attribute-routed controllers
app.MapControllers();

app.Run();
