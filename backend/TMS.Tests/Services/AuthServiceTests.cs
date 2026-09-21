using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using TMS.Application.DTOs.Auth;
using TMS.Application.Settings;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using Xunit;

namespace TMS.Tests.Services;

public class AuthServiceTests
{
    private readonly AppDbContext _db;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);

        var jwtSettings = Options.Create(new JwtSettings
        {
            Key = "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
            Issuer = "TMS.API",
            Audience = "TMS.Angular",
            ExpiryMinutes = 60
        });

        _authService = new AuthService(_db, jwtSettings);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsLoginResponse()
    {
        var request = new RegisterRequest("Test User", "test@example.com", "Password@123", "Password@123");

        var result = await _authService.RegisterAsync(request);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal("test@example.com", result.Email);
        Assert.Equal("Test User", result.FullName);
        Assert.Equal("User", result.Role);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ThrowsInvalidOperationException()
    {
        _db.Users.Add(new User
        {
            FullName = "Existing User",
            Email = "existing@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            Role = UserRole.User
        });
        await _db.SaveChangesAsync();

        var request = new RegisterRequest("New User", "existing@example.com", "Password@123", "Password@123");

        await Assert.ThrowsAsync<InvalidOperationException>(() => _authService.RegisterAsync(request));
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        _db.Users.Add(new User
        {
            FullName = "Test User",
            Email = "login@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            Role = UserRole.User
        });
        await _db.SaveChangesAsync();

        var request = new LoginRequest("login@example.com", "Password@123");

        var result = await _authService.LoginAsync(request);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal("login@example.com", result.Email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsUnauthorizedAccessException()
    {
        _db.Users.Add(new User
        {
            FullName = "Test User",
            Email = "wrong@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
            Role = UserRole.User
        });
        await _db.SaveChangesAsync();

        var request = new LoginRequest("wrong@example.com", "WrongPassword");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task Login_WithNonexistentEmail_ThrowsUnauthorizedAccessException()
    {
        var request = new LoginRequest("nonexistent@example.com", "Password@123");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }
}
