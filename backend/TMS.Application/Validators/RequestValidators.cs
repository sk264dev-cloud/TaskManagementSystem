using FluentValidation;
using TMS.Application.DTOs.Auth;
using TMS.Application.DTOs.Tasks;
using TMS.Application.DTOs.Teams;
using TMS.Application.DTOs.Comments;
using TMS.Application.DTOs.Users;

namespace TMS.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    private const string PasswordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$";

    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
            .Matches(PasswordRegex).WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

public class CreateUserAdminRequestValidator : AbstractValidator<CreateUserAdminRequest>
{
    private const string PasswordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$";

    public CreateUserAdminRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
            .Matches(PasswordRegex).WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(r => r is "Admin" or "Manager" or "User")
            .WithMessage("Role must be Admin, Manager, or User.");
    }
}

public class UpdateUserRoleRequestValidator : AbstractValidator<UpdateUserRoleRequest>
{
    public UpdateUserRoleRequestValidator()
    {
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(r => r is "Admin" or "Manager" or "User")
            .WithMessage("Role must be Admin, Manager, or User.");
    }
}

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Priority).NotEmpty().Must(p => p is "Low" or "Medium" or "High")
            .WithMessage("Priority must be Low, Medium, or High.");
    }
}

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Priority).NotEmpty().Must(p => p is "Low" or "Medium" or "High")
            .WithMessage("Priority must be Low, Medium, or High.");
        RuleFor(x => x.Status).NotEmpty().Must(s => s is "ToDo" or "InProgress" or "Done")
            .WithMessage("Status must be ToDo, InProgress, or Done.");
    }
}

public class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().Must(s => s is "ToDo" or "InProgress" or "Done")
            .WithMessage("Status must be ToDo, InProgress, or Done.");
    }
}

public class CreateTeamRequestValidator : AbstractValidator<CreateTeamRequest>
{
    public CreateTeamRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ManagerId).GreaterThan(0);
    }
}

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Comment).NotEmpty().MaximumLength(1000);
    }
}
