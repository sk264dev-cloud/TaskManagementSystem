import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { Team, TeamMember } from '../../../core/models/models';

@Component({
  selector: 'app-task-form',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <h1>{{ isEdit ? 'Edit Task' : 'Create Task' }}</h1>
      </div>

      <div class="card">
        <div class="card-body p-4">
          <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Title *</label>
              <input type="text" class="form-control" formControlName="title"
                     placeholder="Enter task title" id="task-title">
              <div class="text-danger small mt-1"
                   *ngIf="taskForm.get('title')?.touched && taskForm.get('title')?.errors?.['required']">
                Title is required.
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="4"
                        placeholder="Enter task description" id="task-description"></textarea>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label">Priority *</label>
                <select class="form-select" formControlName="priority" id="task-priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div class="col-md-4" *ngIf="isEdit">
                <label class="form-label">Status *</label>
                <select class="form-select" formControlName="status" id="task-status">
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Deadline</label>
                <input type="date" class="form-control" formControlName="deadline" id="task-deadline">
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Team</label>
                <select class="form-select" formControlName="teamId" (change)="onTeamChange()" id="task-team">
                  <option [ngValue]="null">No team</option>
                  <option *ngFor="let team of teams" [ngValue]="team.id">{{ team.name }}</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Assign To</label>
                <select class="form-select" formControlName="assignedToUserId" id="task-assignee">
                  <option [ngValue]="null">Unassigned</option>
                  <option *ngFor="let member of teamMembers" [ngValue]="member.id">{{ member.fullName }}</option>
                </select>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || loading" id="task-submit">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? 'Update Task' : 'Create Task' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;
  loading = false;
  error = '';
  teams: Team[] = [];
  teamMembers: TeamMember[] = [];
  private taskId?: number;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      priority: ['Medium', Validators.required],
      status: ['ToDo'],
      deadline: [null],
      teamId: [null],
      assignedToUserId: [null]
    });

    this.teamService.getTeams().subscribe(teams => this.teams = teams);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskId = +id;
      this.taskService.getTask(this.taskId).subscribe(task => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline ? task.deadline.split('T')[0] : null,
          teamId: task.teamId,
          assignedToUserId: task.assignedToUserId
        });
        if (task.teamId) this.loadTeamMembers(task.teamId);
      });
    }
  }

  onTeamChange(): void {
    const teamId = this.taskForm.get('teamId')?.value;
    if (teamId) {
      this.loadTeamMembers(teamId);
    } else {
      this.teamMembers = [];
    }
    this.taskForm.patchValue({ assignedToUserId: null });
  }

  loadTeamMembers(teamId: number): void {
    this.teamService.getTeam(teamId).subscribe(team => {
      this.teamMembers = team.members;
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;
    this.loading = true;
    this.error = '';

    const formValue = this.taskForm.value;
    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, formValue).subscribe({
        next: () => this.router.navigate(['/tasks', this.taskId]),
        error: (err) => { this.loading = false; this.error = err.error?.message || 'Update failed.'; }
      });
    } else {
      this.taskService.createTask(formValue).subscribe({
        next: (task) => this.router.navigate(['/tasks', task.id]),
        error: (err) => { this.loading = false; this.error = err.error?.message || 'Creation failed.'; }
      });
    }
  }

  cancel(): void { this.router.navigate(['/tasks']); }
}
