# Team Task Management System

A full-stack task management application with role-based access control, team management, and real-time notifications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 8 Web API, C# |
| **Frontend** | Angular 16, TypeScript, Bootstrap 5 |
| **Database** | PostgreSQL + EF Core 8 (Npgsql) |
| **Auth** | JWT Bearer Authentication + BCrypt |
| **Validation** | FluentValidation |
| **API Docs** | Swagger / OpenAPI |
| **Testing** | xUnit, Moq, EF Core InMemory |
| **DevOps** | Docker, Docker Compose |

## Architecture

```
TaskManagementSystem/
├── backend/
│   ├── TMS.API/            → Controllers, Program.cs, Middleware
│   ├── TMS.Application/    → DTOs, Interfaces, Validators, Settings
│   ├── TMS.Domain/         → Entities, Enums
│   ├── TMS.Infrastructure/ → DbContext, EF Configs, Services
│   └── TMS.Tests/          → Unit Tests (xUnit + Moq)
├── UI/
│   └── myapp/              → Angular 16 Application
├── docker-compose.yml
└── README.md
```

Clean/layered architecture: **API → Application → Domain ← Infrastructure**

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 14+ (Local or Docker)

### Backend Setup

```bash
cd backend
dotnet restore
dotnet build

# Create database and apply migrations
dotnet ef database update --project TMS.Infrastructure --startup-project TMS.API

# Run the API
cd TMS.API
dotnet run
```

The API will be available at `http://localhost:5299`
Swagger UI: `http://localhost:5299/swagger`

### Frontend Setup

```bash
cd UI/myapp
npm install
ng serve
```

The app will be available at `http://localhost:4200`

### Docker Setup

```bash
docker-compose up --build
```

- Frontend: http://localhost:4200
- API: http://localhost:5299
- PostgreSQL: localhost:5432

## Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@tms.com | Admin@123 |
| **Manager** | manager@tms.com | Manager@123 |
| **User** | user@tms.com | User@123 |

## Role-Based Access Control

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| View all tasks | ✅ | Team only | Own only |
| Create tasks | ✅ | ✅ | ✅ |
| Assign tasks | ✅ | ✅ | — |
| Create teams | ✅ | — | — |
| Manage team members | ✅ | Own team | — |
| View dashboard | ✅ (all) | ✅ (team) | ✅ (own) |
| Add comments | ✅ | ✅ | ✅ |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/auth/me` — Get current user info

### Tasks
- `GET /api/tasks` — List tasks (with filters: status, priority, deadline, team)
- `GET /api/tasks/{id}` — Get task details
- `POST /api/tasks` — Create task
- `PUT /api/tasks/{id}` — Update task
- `PATCH /api/tasks/{id}/status` — Update task status only
- `DELETE /api/tasks/{id}` — Delete task

### Teams
- `GET /api/teams` — List teams
- `GET /api/teams/{id}` — Get team details
- `POST /api/teams` — Create team (Admin only)
- `PUT /api/teams/{id}` — Update team (Admin only)
- `DELETE /api/teams/{id}` — Delete team (Admin only)
- `POST /api/teams/{id}/members` — Add member (Admin/Manager)
- `DELETE /api/teams/{id}/members/{userId}` — Remove member (Admin/Manager)

### Comments
- `GET /api/tasks/{taskId}/comments` — List comments for a task
- `POST /api/tasks/{taskId}/comments` — Add comment

### Notifications
- `GET /api/notifications` — List user notifications
- `GET /api/notifications/unread-count` — Get unread count
- `PUT /api/notifications/{id}/read` — Mark as read
- `PUT /api/notifications/read-all` — Mark all as read

### Dashboard
- `GET /api/dashboard` — Get dashboard stats (role-scoped)

## Running Tests

```bash
cd backend
dotnet test
```

## Database Design

| Table | Key Fields |
|-------|-----------|
| **Users** | Id, FullName, Email, PasswordHash, Role (Admin/Manager/User), TeamId |
| **Teams** | Id, Name, ManagerId (FK → Users) |
| **Tasks** | Id, Title, Description, Status, Priority, Deadline, AssignedToUserId, CreatedByUserId, TeamId |
| **TaskComments** | Id, TaskId, UserId, Comment |
| **Notifications** | Id, UserId, TaskId, Type, Message, IsRead |

Enums are stored as strings in the database for readability.
