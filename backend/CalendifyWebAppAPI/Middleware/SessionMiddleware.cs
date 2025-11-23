using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CalendifyWebAppAPI.Middleware
{
    public class SessionMiddleware
    {
        private readonly RequestDelegate _next;
        public SessionMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            // Pre-processing: show user id if in session
            var userId = context.Session.GetInt32("UserId");
            if (userId.HasValue)
            {
                context.Items["CurrentUserId"] = userId.Value;
            }

            await _next(context);

        }
    }
}
