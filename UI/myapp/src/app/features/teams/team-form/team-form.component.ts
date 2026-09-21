import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-form',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <h1>{{ isEdit ? 'Edit Team' : 'Create Team' }}</h1>
      </div>

      <div class="card" style="max-width: 600px;">
        <div class="card-body p-4">
          <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

          <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Team Name *</label>
              <input type="text" class="form-control" formControlName="name"
                     placeholder="Enter team name" id="team-name">
            </div>

            <div class="mb-4">
              <label class="form-label">Manager ID *</label>
              <input type="number" class="form-control" formControlName="managerId"
                     placeholder="Enter manager user ID" id="team-manager">
              <small class="text-muted">Enter the user ID of the team manager.</small>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" [disabled]="teamForm.invalid || loading" id="team-submit">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? 'Update Team' : 'Create Team' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TeamFormComponent implements OnInit {
  teamForm!: FormGroup;
  isEdit = false;
  loading = false;
  error = '';
  private teamId?: number;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      managerId: [null, [Validators.required, Validators.min(1)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.teamId = +id;
      this.teamService.getTeam(this.teamId).subscribe(team => {
        this.teamForm.patchValue({ name: team.name, managerId: team.managerId });
      });
    }
  }

  onSubmit(): void {
    if (this.teamForm.invalid) return;
    this.loading = true;
    this.error = '';

    const value = this.teamForm.value;
    const obs = this.isEdit
      ? this.teamService.updateTeam(this.teamId!, value)
      : this.teamService.createTeam(value);

    obs.subscribe({
      next: (team) => this.router.navigate(['/teams', team.id]),
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Operation failed.'; }
    });
  }

  cancel(): void { this.router.navigate(['/teams']); }
}
