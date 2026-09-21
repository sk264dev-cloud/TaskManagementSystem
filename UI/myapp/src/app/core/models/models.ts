export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdByUserId: number;
  createdByUserName: string;
  teamId?: number;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  assignedToUserId?: number;
  teamId?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority: string;
  status: string;
  deadline?: string;
  assignedToUserId?: number;
  teamId?: number;
}

export interface TaskFilter {
  status?: string;
  priority?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  teamId?: number;
  assignedToUserId?: number;
  searchTerm?: string;
}

export interface Team {
  id: number;
  name: string;
  managerId: number;
  managerName: string;
  createdAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface CreateTeamRequest {
  name: string;
  managerId: number;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  taskId?: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardData {
  totalTasks: number;
  statusCounts: { status: string; count: number }[];
  priorityCounts: { priority: string; count: number }[];
  recentTasks: TaskItem[];
  upcomingDeadlines: TaskItem[];
}

export interface UserAdmin {
  id: number;
  fullName: string;
  email: string;
  role: string;
  teamId?: number;
  teamName?: string;
  createdAt: string;
}

export interface CreateUserAdminRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  teamId?: number;
}

export interface UpdateUserRoleRequest {
  role: string;
}
