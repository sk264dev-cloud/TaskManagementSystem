import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card fade-in">
        <div class="text-center mb-4">
          <i class="bi bi-kanban" style="font-size: 2.5rem; color: var(--primary);"></i>
          <h2 class="mt-2">Create account</h2>
          <p>Get started with TaskFlow</p>
        </div>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" formControlName="fullName"
                   placeholder="Enter your full name" id="register-name">
            <div class="text-danger small mt-1"
                 *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.errors?.['required']">
              Name is required.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Email address</label>
            <input type="email" class="form-control" formControlName="email"
                   placeholder="Enter your email" id="register-email">
            <div class="text-danger small mt-1"
                 *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']">
              Please enter a valid email.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <div class="input-group">
              <input [type]="showPassword ? 'text' : 'password'" class="form-control" formControlName="password"
                     placeholder="Minimum 6 characters" id="register-password">
              <button class="btn btn-outline-secondary" type="button" (click)="showPassword = !showPassword"
                      [title]="showPassword ? 'Hide password' : 'Show password'">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="form-text small text-muted">
              Must be at least 6 characters with uppercase, lowercase, digit, and special symbol.
            </div>
            <div class="text-danger small mt-1"
                 *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              Password must meet complexity requirements.
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Confirm Password</label>
            <div class="input-group">
              <input [type]="showConfirmPassword ? 'text' : 'password'" class="form-control" formControlName="confirmPassword"
                     placeholder="Re-enter your password" id="register-confirm">
              <button class="btn btn-outline-secondary" type="button" (click)="showConfirmPassword = !showConfirmPassword"
                      [title]="showConfirmPassword ? 'Hide password' : 'Show password'">
                <i [class]="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="text-danger small mt-1"
                 *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched">
              Passwords do not match.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2" id="register-submit"
                  [disabled]="registerForm.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="text-center mt-3">
          <span class="text-muted">Already have an account? </span>
          <a routerLink="/login" class="text-decoration-none" style="color: var(--primary); font-weight: 500;">
            Sign in
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(passwordRegex)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
