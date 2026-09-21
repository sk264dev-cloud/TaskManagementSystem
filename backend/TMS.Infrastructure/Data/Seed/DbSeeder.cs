using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Domain.Enums;

namespace TMS.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var managerPasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123");
        var userPasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123");

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "System Admin",
                Email = "admin@tms.com",
                PasswordHash = adminPasswordHash,
                Role = UserRole.Admin,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                FullName = "Team Manager",
                Email = "manager@tms.com",
                PasswordHash = managerPasswordHash,
                Role = UserRole.Manager,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 3,
                FullName = "Regular User",
                Email = "user@tms.com",
                PasswordHash = userPasswordHash,
                Role = UserRole.User,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<Team>().HasData(
            new Team
            {
                Id = 1,
                Name = "Development Team",
                ManagerId = 2,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem
            {
                Id = 1,
                Title = "Setup project repository",
                Description = "Initialize the project repository with proper folder structure and README.",
                Status = TaskItemStatus.Done,
                Priority = TaskPriority.High,
                Deadline = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                AssignedToUserId = 3,
                CreatedByUserId = 2,
                TeamId = 1,
                CreatedAt = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new TaskItem
            {
                Id = 2,
                Title = "Design database schema",
                Description = "Create the ERD and define all tables, relationships, and constraints.",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.High,
                Deadline = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                AssignedToUserId = 3,
                CreatedByUserId = 2,
                TeamId = 1,
                CreatedAt = new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new TaskItem
            {
                Id = 3,
                Title = "Implement authentication",
                Description = "Set up JWT-based authentication with login and registration endpoints.",
                Status = TaskItemStatus.ToDo,
                Priority = TaskPriority.Medium,
                Deadline = new DateTime(2024, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                AssignedToUserId = 3,
                CreatedByUserId = 2,
                TeamId = 1,
                CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
