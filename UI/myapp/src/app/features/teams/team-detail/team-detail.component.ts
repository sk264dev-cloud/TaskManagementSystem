import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team } from '../../../core/models/models';

@Component({
  selector: 'app-team-detail',
  template: `
    <div class="main-content fade-in" *ngIf="team">
      <div class="page-header">
        <div>
          <nav>
            <a routerLink="/teams" class="text-decoration-none small" style="color: var(--primary);">
              <i class="bi bi-arrow-left me-1"></i>Back to Teams
            </a>
          </nav>
          <h1 class="mt-2">{{ team.name }}</h1>
        </div>
        <div class="d-flex gap-2" *ngIf="authService.hasRole('Admin')">
          <button class="btn btn-outline-primary" [routerLink]="['/teams', team.id, 'edit']">
            <i class="bi bi-pencil me-1"></i>Edit
          </button>
          <button class="btn btn-outline-danger" (click)="deleteTeam()">
            <i class="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-people me-2"></i>Members ({{ team.members.length }})</span>
            </div>
            <div class="card-body p-0">
              <div *ngIf="canManageMembers" class="p-3 border-bottom">
                <div class="d-flex gap-2">
                  <input type="number" class="form-control" [(ngModel)]="newMemberId"
                         placeholder="Enter user ID to add" id="add-member-input">
                  <button class="btn btn-primary" (click)="addMember()" [disabled]="!newMemberId" id="add-member-btn">
                    <i class="bi bi-person-plus me-1"></i>Add
                  </button>
                </div>
              </div>

              <div *ngIf="team.members.length === 0" class="empty-state py-4">
                <i class="bi bi-people"></i>
                <p class="mb-0">No members yet</p>
              </div>

              <div *ngFor="let member of team.members" class="d-flex align-items-center p-3 border-bottom">
                <div class="rounded-circle d-flex align-items-center justify-content-center me-3"
                     style="width: 40px; height: 40px; background: var(--primary-light); color: white; font-weight: 600;">
                  {{ member.fullName.charAt(0) }}
                </div>
                <div class="flex-grow-1">
                  <div class="fw-medium">{{ member.fullName }}</div>
                  <small class="text-muted">{{ member.email }} · {{ member.role }}</small>
                </div>
                <button *ngIf="canManageMembers && member.id !== team.managerId"
                        class="btn btn-sm btn-outline-danger"
                        (click)="removeMember(member.id)" title="Remove member">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-3">Team Info</h6>
              <div class="mb-3">
                <small class="text-muted d-block">Manager</small>
                <span class="fw-medium">{{ team.managerName }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Total Members</small>
                <span>{{ team.members.length }}</span>
              </div>
              <div>
                <small class="text-muted d-block">Created</small>
                <span>{{ team.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  newMemberId: number | null = null;
  canManageMembers = false;

  constructor(
    private teamService: TeamService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.canManageMembers = this.authService.hasAnyRole('Admin', 'Manager');
    this.loadTeam(id);
  }

  loadTeam(id: number): void {
    this.teamService.getTeam(id).subscribe(team => this.team = team);
  }

  addMember(): void {
    if (!this.team || !this.newMemberId) return;
    this.teamService.assignMember(this.team.id, this.newMemberId).subscribe({
      next: () => { this.loadTeam(this.team!.id); this.newMemberId = null; },
      error: (err) => alert(err.error?.message || 'Failed to add member.')
    });
  }

  removeMember(userId: number): void {
    if (!this.team || !confirm('Remove this member from the team?')) return;
    this.teamService.removeMember(this.team.id, userId).subscribe(() => this.loadTeam(this.team!.id));
  }

  deleteTeam(): void {
    if (!this.team || !confirm('Delete this team?')) return;
    this.teamService.deleteTeam(this.team.id).subscribe(() => this.router.navigate(['/teams']));
  }
}
