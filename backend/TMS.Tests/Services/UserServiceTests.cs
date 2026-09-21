using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Users;
using TMS.Application.Validators;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using Xunit;

namespace TMS.Tests.Services;

public class UserServiceTests
{
    private readonly AppDbContext _db;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);
        _userService = new UserService(_db);
    }

    [Fact]
    public async Task CreateUser_AsManager_Succeeds()
    {
        var request = new CreateUserAdminRequest("New Manager", "manager2@tms.com", "Manager@123", "Manager", null);

        var result = await _userService.CreateUserAsync(request);

        Assert.NotNull(result);
        Assert.Equal("New Manager", result.FullName);
        Assert.Equal("manager2@tms.com", result.Email);
        Assert.Equal("Manager", result.Role);
    }

    [Fact]
    public async Task CreateUser_AsAdmin_Succeeds()
    {
        var request = new CreateUserAdminRequest("New Admin", "admin2@tms.com", "Admin@123", "Admin", null);

        var result = await _userService.CreateUserAsync(request);

        Assert.NotNull(result);
        Assert.Equal("New Admin", result.FullName);
        Assert.Equal("Admin", result.Role);
    }

    [Fact]
    public async Task UpdateUserRole_PromotesUserToManager()
    {
        var user = new User
        {
            Id = 10,
            FullName = "Standard Member",
            Email = "member@tms.com",
            PasswordHash = "hash",
            Role = UserRole.User
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var result = await _userService.UpdateUserRoleAsync(10, new UpdateUserRoleRequest("Manager"));

        Assert.Equal("Manager", result.Role);
    }

    [Theory]
    [InlineData("simple")] // no upper, no digit, no special
    [InlineData("123456")] // no letters, no special
    [InlineData("Password")] // no digit, no special
    [InlineData("Password1")] // no special
    [InlineData("Pass@")] // less than 6 chars
    public void PasswordValidator_RejectsWeakPasswords(string weakPassword)
    {
        var validator = new RegisterRequestValidator();
        var request = new TMS.Application.DTOs.Auth.RegisterRequest("Test User", "test@test.com", weakPassword, weakPassword);

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Password");
    }

    [Theory]
    [InlineData("Admin@123")]
    [InlineData("Strong#99")]
    [InlineData("Secure$1")]
    public void PasswordValidator_AcceptsCompliantPasswords(string strongPassword)
    {
        var validator = new RegisterRequestValidator();
        var request = new TMS.Application.DTOs.Auth.RegisterRequest("Test User", "test@test.com", strongPassword, strongPassword);

        var result = validator.Validate(request);

        Assert.True(result.IsValid);
    }
}
