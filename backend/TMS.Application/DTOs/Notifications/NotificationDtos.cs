namespace TMS.Application.DTOs.Notifications;

public record NotificationResponse(
    int Id,
    int? TaskId,
    string Type,
    string Message,
    bool IsRead,
    DateTime CreatedAt);
