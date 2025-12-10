using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EventReview> AddReviewAsync(EventReview review)
        {
            review.CreatedAt = DateTime.UtcNow;
            _context.EventReviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<List<EventReview>> GetReviewsByEventIdAsync(int eventId)
        {
            return await _context.EventReviews
                .Where(r => r.EventId == eventId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}

