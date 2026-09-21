using TMS.Application.DTOs.Auth;
using TMS.Application.DTOs.Tasks;
using TMS.Application.DTOs.Teams;
using TMS.Application.DTOs.Comments;
using TMS.Application.DTOs.Notifications;
using TMS.Application.DTOs.Dashboard;
using TMS.Application.DTOs.Users;
using TMS.Domain.Enums;

namespace TMS.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RegisterAsync(RegisterRequest request);
}

public interface IUserService
{
    Task<List<UserResponse>> GetUsersAsync();
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<UserResponse> CreateUserAsync(CreateUserAdminRequest request);
    Task<UserResponse> UpdateUserRoleAsync(int id, UpdateUserRoleRequest request);
    Task DeleteUserAsync(int id, int currentAdminId);
}

public interface ITaskService
{
    Task<List<TaskResponse>> GetTasksAsync(TaskFilterRequest filter, int userId, string userRole);
    Task<TaskResponse?> GetTaskByIdAsync(int id, int userId, string userRole);
    Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, int userId);
    Task<TaskResponse> UpdateTaskAsync(int id, UpdateTaskRequest request, int userId, string userRole);
    Task UpdateTaskStatusAsync(int id, UpdateTaskStatusRequest request, int userId);
    Task DeleteTaskAsync(int id, int userId, string userRole);
}

public interface ITeamService
{
    Task<List<TeamResponse>> GetTeamsAsync(int userId, string userRole);
    Task<TeamResponse?> GetTeamByIdAsync(int id);
    Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request);
    Task<TeamResponse> UpdateTeamAsync(int id, UpdateTeamRequest request);
    Task DeleteTeamAsync(int id);
    Task AssignMemberAsync(int teamId, AssignMemberRequest request);
    Task RemoveMemberAsync(int teamId, int userId);
}

public interface ICommentService
{
    Task<List<CommentResponse>> GetCommentsAsync(int taskId);
    Task<CommentResponse> AddCommentAsync(int taskId, CreateCommentRequest request, int userId);
}

public interface INotificationService
{
    Task<List<NotificationResponse>> GetNotificationsAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
    Task CreateNotificationAsync(int userId, int? taskId, NotificationType type, string message);
}

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(int userId, string userRole);
}
