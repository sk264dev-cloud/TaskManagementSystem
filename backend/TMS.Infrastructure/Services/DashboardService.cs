using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Dashboard;
using TMS.Application.DTOs.Tasks;
using TMS.Application.Interfaces;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardResponse> GetDashboardAsync(int userId, string userRole)
    {
        var query = _db.Tasks
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .Include(t => t.Team)
            .AsQueryable();

        if (userRole == nameof(UserRole.User))
            query = query.Where(t => t.AssignedToUserId == userId || t.CreatedByUserId == userId);
        else if (userRole == nameof(UserRole.Manager))
        {
            var user = await _db.Users.FindAsync(userId);
            if (user?.TeamId != null)
                query = query.Where(t => t.TeamId == user.TeamId || t.CreatedByUserId == userId);
        }

        var tasks = await query.ToListAsync();

        var statusCounts = tasks
            .GroupBy(t => t.Status.ToString())
            .Select(g => new StatusCount(g.Key, g.Count()))
            .ToList();

        var priorityCounts = tasks
            .GroupBy(t => t.Priority.ToString())
            .Select(g => new PriorityCount(g.Key, g.Count()))
            .ToList();

        var recentTasks = tasks
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new TaskResponse(
                t.Id, t.Title, t.Description,
                t.Status.ToString(), t.Priority.ToString(),
                t.Deadline,
                t.AssignedToUserId, t.AssignedToUser?.FullName,
                t.CreatedByUserId, t.CreatedByUser?.FullName ?? "",
                t.TeamId, t.Team?.Name,
                t.CreatedAt, t.UpdatedAt,
                t.Comments?.Count ?? 0))
            .ToList();

        var upcomingDeadlines = tasks
            .Where(t => t.Deadline.HasValue && t.Deadline > DateTime.UtcNow && t.Status != TaskItemStatus.Done)
            .OrderBy(t => t.Deadline)
            .Take(5)
            .Select(t => new TaskResponse(
                t.Id, t.Title, t.Description,
                t.Status.ToString(), t.Priority.ToString(),
                t.Deadline,
                t.AssignedToUserId, t.AssignedToUser?.FullName,
                t.CreatedByUserId, t.CreatedByUser?.FullName ?? "",
                t.TeamId, t.Team?.Name,
                t.CreatedAt, t.UpdatedAt,
                t.Comments?.Count ?? 0))
            .ToList();

        return new DashboardResponse(
            tasks.Count, statusCounts, priorityCounts,
            recentTasks, upcomingDeadlines);
    }
}
