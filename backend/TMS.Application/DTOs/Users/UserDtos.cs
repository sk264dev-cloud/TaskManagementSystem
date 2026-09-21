namespace TMS.Application.DTOs.Users;

public record UserResponse(
    int Id,
    string FullName,
    string Email,
    string Role,
    int? TeamId,
    string? TeamName,
    DateTime CreatedAt);

public record CreateUserAdminRequest(
    string FullName,
    string Email,
    string Password,
    string Role,
    int? TeamId);

public record UpdateUserRoleRequest(
    string Role);
