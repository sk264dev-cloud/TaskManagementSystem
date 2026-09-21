using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Tasks;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;

    public TaskService(AppDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<List<TaskResponse>> GetTasksAsync(TaskFilterRequest filter, int userId, string userRole)
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

        if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse<TaskItemStatus>(filter.Status, out var status))
            query = query.Where(t => t.Status == status);

        if (!string.IsNullOrEmpty(filter.Priority) && Enum.TryParse<TaskPriority>(filter.Priority, out var priority))
            query = query.Where(t => t.Priority == priority);

        if (filter.DeadlineFrom.HasValue)
            query = query.Where(t => t.Deadline >= filter.DeadlineFrom.Value);

        if (filter.DeadlineTo.HasValue)
            query = query.Where(t => t.Deadline <= filter.DeadlineTo.Value);

        if (filter.TeamId.HasValue)
            query = query.Where(t => t.TeamId == filter.TeamId.Value);

        if (filter.AssignedToUserId.HasValue)
            query = query.Where(t => t.AssignedToUserId == filter.AssignedToUserId.Value);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(t => t.Title.Contains(filter.SearchTerm) || (t.Description != null && t.Description.Contains(filter.SearchTerm)));

        return await query.OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToResponse(t))
            .ToListAsync();
    }

    public async Task<TaskResponse?> GetTaskByIdAsync(int id, int userId, string userRole)
    {
        var task = await _db.Tasks
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .Include(t => t.Team)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return null;

        if (userRole == nameof(UserRole.User) && task.AssignedToUserId != userId && task.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this task.");

        return MapToResponse(task);
    }

    public async Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, int userId)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = Enum.Parse<TaskPriority>(request.Priority),
            Deadline = request.Deadline,
            AssignedToUserId = request.AssignedToUserId,
            CreatedByUserId = userId,
            TeamId = request.TeamId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        if (request.AssignedToUserId.HasValue && request.AssignedToUserId.Value != userId)
        {
            await _notifications.CreateNotificationAsync(
                request.AssignedToUserId.Value,
                task.Id,
                NotificationType.Assignment,
                $"You have been assigned to task: {task.Title}");
        }

        return await GetTaskByIdAsync(task.Id, userId, nameof(UserRole.Admin)) ?? throw new Exception("Task creation failed.");
    }

    public async Task<TaskResponse> UpdateTaskAsync(int id, UpdateTaskRequest request, int userId, string userRole)
    {
        var task = await _db.Tasks.FindAsync(id) ?? throw new KeyNotFoundException("Task not found.");

        if (userRole == nameof(UserRole.User) && task.CreatedByUserId != userId && task.AssignedToUserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to update this task.");

        var oldAssignee = task.AssignedToUserId;
        var oldStatus = task.Status;

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = Enum.Parse<TaskPriority>(request.Priority);
        task.Status = Enum.Parse<TaskItemStatus>(request.Status);
        task.Deadline = request.Deadline;
        task.AssignedToUserId = request.AssignedToUserId;
        task.TeamId = request.TeamId;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (request.AssignedToUserId.HasValue && request.AssignedToUserId != oldAssignee)
        {
            await _notifications.CreateNotificationAsync(
                request.AssignedToUserId.Value,
                task.Id,
                NotificationType.Assignment,
                $"You have been assigned to task: {task.Title}");
        }

        if (task.Status != oldStatus && task.AssignedToUserId.HasValue)
        {
            await _notifications.CreateNotificationAsync(
                task.AssignedToUserId.Value,
                task.Id,
                NotificationType.StatusUpdate,
                $"Task '{task.Title}' status changed to {task.Status}");
        }

        return await GetTaskByIdAsync(id, userId, nameof(UserRole.Admin)) ?? throw new Exception("Task update failed.");
    }

    public async Task UpdateTaskStatusAsync(int id, UpdateTaskStatusRequest request, int userId)
    {
        var task = await _db.Tasks.FindAsync(id) ?? throw new KeyNotFoundException("Task not found.");

        if (task.AssignedToUserId != userId && task.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to update this task's status.");

        var oldStatus = task.Status;
        task.Status = Enum.Parse<TaskItemStatus>(request.Status);
        task.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        if (task.CreatedByUserId != userId)
        {
            await _notifications.CreateNotificationAsync(
                task.CreatedByUserId,
                task.Id,
                NotificationType.StatusUpdate,
                $"Task '{task.Title}' status changed from {oldStatus} to {task.Status}");
        }
    }

    public async Task DeleteTaskAsync(int id, int userId, string userRole)
    {
        var task = await _db.Tasks.FindAsync(id) ?? throw new KeyNotFoundException("Task not found.");

        if (userRole == nameof(UserRole.User) && task.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to delete this task.");

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
    }

    private static TaskResponse MapToResponse(TaskItem t) => new(
        t.Id, t.Title, t.Description,
        t.Status.ToString(), t.Priority.ToString(),
        t.Deadline,
        t.AssignedToUserId, t.AssignedToUser?.FullName,
        t.CreatedByUserId, t.CreatedByUser?.FullName ?? "",
        t.TeamId, t.Team?.Name,
        t.CreatedAt, t.UpdatedAt,
        t.Comments?.Count ?? 0);
}
