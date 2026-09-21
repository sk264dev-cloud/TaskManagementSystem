import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card fade-in">
        <div class="text-center mb-4">
          <i class="bi bi-kanban" style="font-size: 2.5rem; color: var(--primary);"></i>
          <h2 class="mt-2">Welcome back</h2>
          <p>Sign in to your TaskFlow account</p>
        </div>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Email address</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input type="email" class="form-control" formControlName="email"
                     placeholder="Enter your email" id="login-email">
            </div>
            <div class="text-danger small mt-1"
                 *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']">
              Email is required.
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input [type]="showPassword ? 'text' : 'password'" class="form-control" formControlName="password"
                     placeholder="Enter your password" id="login-password">
              <button class="btn btn-outline-secondary" type="button" (click)="showPassword = !showPassword"
                      [title]="showPassword ? 'Hide password' : 'Show password'">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="text-danger small mt-1"
                 *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']">
              Password is required.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2" id="login-submit"
                  [disabled]="loginForm.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center mt-3">
          <span class="text-muted">Don't have an account? </span>
          <a routerLink="/register" class="text-decoration-none" style="color: var(--primary); font-weight: 500;">
            Create account
          </a>
        </div>

        <div class="mt-4 p-3 rounded" style="background: var(--surface);">
          <div class="small fw-semibold text-muted mb-2">Default Credentials:</div>
          <div class="small text-muted">
            <div><strong>Admin:</strong> admin&#64;tms.com / Admin&#64;123</div>
            <div><strong>Manager:</strong> manager&#64;tms.com / Manager&#64;123</div>
            <div><strong>User:</strong> user&#64;tms.com / User&#64;123</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
