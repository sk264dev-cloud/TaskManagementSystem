using Microsoft.EntityFrameworkCore;
using Moq;
using TMS.Application.DTOs.Tasks;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using Xunit;

namespace TMS.Tests.Services;

public class TaskServiceTests
{
    private readonly AppDbContext _db;
    private readonly TaskService _taskService;
    private readonly Mock<INotificationService> _notificationMock;

    public TaskServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);
        _notificationMock = new Mock<INotificationService>();
        _taskService = new TaskService(_db, _notificationMock.Object);

        SeedData();
    }

    private void SeedData()
    {
        _db.Users.AddRange(
            new User { Id = 1, FullName = "Admin", Email = "admin@test.com", PasswordHash = "hash", Role = UserRole.Admin },
            new User { Id = 2, FullName = "Manager", Email = "manager@test.com", PasswordHash = "hash", Role = UserRole.Manager, TeamId = 1 },
            new User { Id = 3, FullName = "User", Email = "user@test.com", PasswordHash = "hash", Role = UserRole.User, TeamId = 1 }
        );

        _db.Teams.Add(new Team { Id = 1, Name = "Dev Team", ManagerId = 2 });

        _db.Tasks.AddRange(
            new TaskItem { Id = 1, Title = "Task 1", Status = TaskItemStatus.ToDo, Priority = TaskPriority.High, CreatedByUserId = 2, AssignedToUserId = 3, TeamId = 1 },
            new TaskItem { Id = 2, Title = "Task 2", Status = TaskItemStatus.InProgress, Priority = TaskPriority.Medium, CreatedByUserId = 2, TeamId = 1 },
            new TaskItem { Id = 3, Title = "Task 3", Status = TaskItemStatus.Done, Priority = TaskPriority.Low, CreatedByUserId = 1 }
        );

        _db.SaveChanges();
    }

    [Fact]
    public async Task GetTasks_AsAdmin_ReturnsAllTasks()
    {
        var filter = new TaskFilterRequest();
        var tasks = await _taskService.GetTasksAsync(filter, 1, "Admin");

        Assert.Equal(3, tasks.Count);
    }

    [Fact]
    public async Task GetTasks_AsUser_ReturnsOnlyAssignedOrCreatedTasks()
    {
        var filter = new TaskFilterRequest();
        var tasks = await _taskService.GetTasksAsync(filter, 3, "User");

        Assert.Single(tasks);
        Assert.Equal("Task 1", tasks[0].Title);
    }

    [Fact]
    public async Task GetTasks_WithStatusFilter_ReturnsFilteredTasks()
    {
        var filter = new TaskFilterRequest { Status = "ToDo" };
        var tasks = await _taskService.GetTasksAsync(filter, 1, "Admin");

        Assert.Single(tasks);
        Assert.Equal("ToDo", tasks[0].Status);
    }

    [Fact]
    public async Task CreateTask_WithValidData_CreatesAndReturnsTask()
    {
        var request = new CreateTaskRequest("New Task", "Description", "High", null, 3, 1);

        var result = await _taskService.CreateTaskAsync(request, 2);

        Assert.NotNull(result);
        Assert.Equal("New Task", result.Title);
        Assert.Equal("High", result.Priority);
    }

    [Fact]
    public async Task CreateTask_WithAssignee_SendsNotification()
    {
        var request = new CreateTaskRequest("Assigned Task", null, "Medium", null, 3, 1);

        await _taskService.CreateTaskAsync(request, 2);

        _notificationMock.Verify(n => n.CreateNotificationAsync(
            3, It.IsAny<int>(), NotificationType.Assignment, It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTask_AsUser_WhenNotCreator_ThrowsUnauthorized()
    {
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _taskService.DeleteTaskAsync(2, 3, "User"));
    }

    [Fact]
    public async Task UpdateTaskStatus_ValidTransition_UpdatesStatus()
    {
        var request = new UpdateTaskStatusRequest("InProgress");

        await _taskService.UpdateTaskStatusAsync(1, request, 3);

        var task = await _db.Tasks.FindAsync(1);
        Assert.Equal(TaskItemStatus.InProgress, task!.Status);
    }
}
