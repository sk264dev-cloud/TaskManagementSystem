using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Notifications;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<NotificationResponse>> GetNotificationsAsync(int userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationResponse(
                n.Id, n.TaskId, n.Type.ToString(),
                n.Message, n.IsRead, n.CreatedAt))
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId)
            ?? throw new KeyNotFoundException("Notification not found.");

        notification.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(n => n.SetProperty(x => x.IsRead, true));
    }

    public async Task CreateNotificationAsync(int userId, int? taskId, NotificationType type, string message)
    {
        var notification = new Notification
        {
            UserId = userId,
            TaskId = taskId,
            Type = type,
            Message = message
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
    }
}
