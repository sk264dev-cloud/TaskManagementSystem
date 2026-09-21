using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Users;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<UserResponse>> GetUsersAsync()
    {
        return await _db.Users
            .Include(u => u.Team)
            .OrderBy(u => u.Id)
            .Select(u => new UserResponse(
                u.Id,
                u.FullName,
                u.Email,
                u.Role.ToString(),
                u.TeamId,
                u.Team != null ? u.Team.Name : null,
                u.CreatedAt))
            .ToListAsync();
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var user = await _db.Users
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TeamId,
            user.Team != null ? user.Team.Name : null,
            user.CreatedAt);
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserAdminRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("A user with this email already exists.");

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            throw new ArgumentException($"Invalid role: {request.Role}");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            TeamId = request.TeamId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        string? teamName = null;
        if (user.TeamId.HasValue)
        {
            var team = await _db.Teams.FindAsync(user.TeamId.Value);
            teamName = team?.Name;
        }

        return new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TeamId,
            teamName,
            user.CreatedAt);
    }

    public async Task<UserResponse> UpdateUserRoleAsync(int id, UpdateUserRoleRequest request)
    {
        var user = await _db.Users
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found.");

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            throw new ArgumentException($"Invalid role: {request.Role}");

        user.Role = role;
        await _db.SaveChangesAsync();

        return new UserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TeamId,
            user.Team != null ? user.Team.Name : null,
            user.CreatedAt);
    }

    public async Task DeleteUserAsync(int id, int currentAdminId)
    {
        if (id == currentAdminId)
            throw new InvalidOperationException("You cannot delete your own account.");

        var user = await _db.Users.FindAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {id} not found.");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }
}
