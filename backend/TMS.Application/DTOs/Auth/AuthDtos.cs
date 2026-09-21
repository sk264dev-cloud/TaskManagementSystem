namespace TMS.Application.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string FullName, string Email, string Password, string ConfirmPassword);

public record LoginResponse(string Token, int UserId, string FullName, string Email, string Role);
