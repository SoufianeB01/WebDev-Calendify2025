using CalendifyWebAppAPI.Models;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IReviewService
    {
        Task<EventReview> AddReviewAsync(EventReview review);
        Task<List<EventReview>> GetReviewsByEventIdAsync(int eventId);
    }
}

