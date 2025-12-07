using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

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
        ? CookieSecurePolicy.None    // allow cookie over http in dev
        : CookieSecurePolicy.Always;
});

// CORS (dev) allow credentials
builder.Services.AddCors(o =>
{
    o.AddPolicy("Dev", p =>
        p.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Register password hasher for Employee
builder.Services.AddScoped<IPasswordHasher<CalendifyWebAppAPI.Models.Employee>, PasswordHasher<CalendifyWebAppAPI.Models.Employee>>();

var app = builder.Build();



if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Dev"); // CORS
app.UseSession();
app.UseMiddleware<CalendifyWebAppAPI.Middleware.SessionMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.Run();
