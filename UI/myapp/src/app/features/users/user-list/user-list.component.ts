import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserAdmin } from '../../../core/models/models';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="main-content fade-in">
      <div class="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 fw-bold mb-1">User & Role Management</h1>
          <p class="text-muted mb-0">Create new Admins, Managers, and Users or manage existing account roles.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1" (click)="openCreateModal()">
          <i class="bi bi-person-plus-fill"></i>
          <span>Add New User</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="card mb-4 border-0 shadow-sm">
        <div class="card-body py-3">
          <div class="row g-3 align-items-center">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0 bg-light" placeholder="Search by name or email..."
                       [(ngModel)]="searchTerm" (input)="onSearchChange()">
              </div>
            </div>
            <div class="col-md-4">
              <select class="form-select bg-light" [(ngModel)]="roleFilter" (change)="onSearchChange()">
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="User">User</option>
              </select>
            </div>
            <div class="col-md-3 text-end text-muted small">
              Total Users: <strong>{{ filteredUsers.length }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div class="alert alert-success alert-dismissible fade show" *ngIf="successMessage">
        <i class="bi bi-check-circle me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>
      <div class="alert alert-danger alert-dismissible fade show" *ngIf="errorMessage">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Users Table Card -->
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table align-middle mb-0 table-hover">
            <thead class="table-light">
              <tr>
                <th class="ps-3">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Created</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-people display-6 d-block mb-2 text-secondary"></i>
                  No users found matching your criteria.
                </td>
              </tr>
              <tr *ngFor="let user of paginatedUsers">
                <td class="ps-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ user.fullName }}</div>
                      <small class="text-muted">ID: #{{ user.id }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" [ngClass]="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span *ngIf="user.teamName" class="badge bg-light text-dark border">
                    <i class="bi bi-people me-1"></i>{{ user.teamName }}
                  </span>
                  <span *ngIf="!user.teamName" class="text-muted small">None</span>
                </td>
                <td class="small text-muted">{{ user.createdAt | date:'mediumDate' }}</td>
                <td class="text-end pe-3">
                  <div class="d-inline-flex align-items-center gap-2">
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                              (click)="toggleRoleDropdown(user.id, $event)">
                        Change Role
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm" [class.show]="activeRoleDropdownId === user.id"
                          style="position: absolute; z-index: 1050;">
                        <li><h6 class="dropdown-header">Select New Role</h6></li>
                        <li><a class="dropdown-item cursor-pointer" (click)="changeRole(user, 'Admin')">Admin</a></li>
                        <li><a class="dropdown-item cursor-pointer" (click)="changeRole(user, 'Manager')">Manager</a></li>
                        <li><a class="dropdown-item cursor-pointer" (click)="changeRole(user, 'User')">User</a></li>
                      </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user)" 
                            [disabled]="user.id === currentUserId"
                            title="Delete User">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5-Record Pagination Footer -->
        <div class="card-footer bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2"
             *ngIf="filteredUsers.length > 0">
          <div class="text-muted small">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredUsers.length }} users
          </div>
          <nav aria-label="Users pagination">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <a class="page-link cursor-pointer" (click)="setPage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i> Previous
                </a>
              </li>
              <li class="page-item" *ngFor="let page of pages" [class.active]="currentPage === page">
                <a class="page-link cursor-pointer" (click)="setPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" [class.disabled]="currentPage === totalPages">
                <a class="page-link cursor-pointer" (click)="setPage(currentPage + 1)">
                  Next <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div class="modal fade show d-block" *ngIf="showModal" style="background: rgba(15, 23, 42, 0.5); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Create New User</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="alert alert-danger py-2 small" *ngIf="modalError">{{ modalError }}</div>

            <form [formGroup]="userForm" (ngSubmit)="onSubmitCreate()">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Full Name *</label>
                <input type="text" class="form-control" formControlName="fullName" placeholder="e.g. Sarah Jenkins">
                <div class="text-danger small mt-1" *ngIf="userForm.get('fullName')?.touched && userForm.get('fullName')?.invalid">
                  Full name is required.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Email Address *</label>
                <input type="email" class="form-control" formControlName="email" placeholder="e.g. sarah@example.com">
                <div class="text-danger small mt-1" *ngIf="userForm.get('email')?.touched && userForm.get('email')?.invalid">
                  Please provide a valid email.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Assign Role *</label>
                <select class="form-select" formControlName="role">
                  <option value="Admin">Admin (Full system control)</option>
                  <option value="Manager">Manager (Team & task leader)</option>
                  <option value="User">User (Standard team member)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Password *</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input [type]="showPassword ? 'text' : 'password'" class="form-control" formControlName="password"
                         placeholder="Minimum 6 characters">
                  <button class="btn btn-outline-secondary" type="button" (click)="showPassword = !showPassword">
                    <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div class="form-text small text-muted">
                  Must be at least 6 characters with uppercase, lowercase, digit, and special symbol.
                </div>
                <div class="text-danger small mt-1" *ngIf="userForm.get('password')?.touched && userForm.get('password')?.invalid">
                  Password must satisfy complexity requirements.
                </div>
              </div>

              <div class="modal-footer border-top-0 px-0 pb-0 pt-3">
                <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary px-4" [disabled]="userForm.invalid || isSubmitting">
                  <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .badge-admin { background-color: #6366f1; color: white; }
    .badge-manager { background-color: #0ea5e9; color: white; }
    .badge-user { background-color: #64748b; color: white; }
    .cursor-pointer { cursor: pointer; }
    .table th { font-weight: 600; font-size: 0.85rem; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
    .pagination .page-link { color: #4f46e5; }
    .pagination .page-item.active .page-link { background-color: #4f46e5; border-color: #4f46e5; color: white; }
  `]
})
export class UserListComponent implements OnInit {
  users: UserAdmin[] = [];
  searchTerm = '';
  roleFilter = '';
  pageSize = 5;
  currentPage = 1;
  currentUserId = 0;

  showModal = false;
  showPassword = false;
  isSubmitting = false;
  userForm!: FormGroup;

  modalError = '';
  successMessage = '';
  errorMessage = '';
  activeRoleDropdownId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.userId || 0;
    this.initForm();
    this.loadUsers();
  }

  initForm(): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['User', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(passwordRegex)]]
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.currentPage = 1;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load users.';
      }
    });
  }

  get filteredUsers(): UserAdmin[] {
    return this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      return matchSearch && matchRole;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredUsers.length);
  }

  get paginatedUsers(): UserAdmin[] {
    return this.filteredUsers.slice(this.startIndex, this.endIndex);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin': return 'badge-admin';
      case 'Manager': return 'badge-manager';
      default: return 'badge-user';
    }
  }

  toggleRoleDropdown(userId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activeRoleDropdownId = this.activeRoleDropdownId === userId ? null : userId;
  }

  changeRole(user: UserAdmin, newRole: string): void {
    this.activeRoleDropdownId = null;
    if (user.role === newRole) return;

    this.userService.updateUserRole(user.id, { role: newRole }).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.successMessage = `Updated role for ${user.fullName} to ${newRole}.`;
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update user role.';
        setTimeout(() => this.errorMessage = '', 3500);
      }
    });
  }

  deleteUser(user: UserAdmin): void {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = `User ${user.fullName} deleted successfully.`;
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3500);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to delete user.';
          setTimeout(() => this.errorMessage = '', 3500);
        }
      });
    }
  }

  openCreateModal(): void {
    this.userForm.reset({ role: 'User' });
    this.modalError = '';
    this.showPassword = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmitCreate(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    this.modalError = '';

    this.userService.createUser(this.userForm.value).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showModal = false;
        this.successMessage = `User "${created.fullName}" created with role "${created.role}".`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modalError = err.error?.message || 'Failed to create user. Ensure the email is not already taken.';
      }
    });
  }
}
