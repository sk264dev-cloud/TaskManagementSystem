import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserAdmin, CreateUserAdminRequest, UpdateUserRoleRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(this.apiUrl);
  }

  getUser(id: number): Observable<UserAdmin> {
    return this.http.get<UserAdmin>(`${this.apiUrl}/${id}`);
  }

  createUser(request: CreateUserAdminRequest): Observable<UserAdmin> {
    return this.http.post<UserAdmin>(this.apiUrl, request);
  }

  updateUserRole(id: number, request: UpdateUserRoleRequest): Observable<UserAdmin> {
    return this.http.put<UserAdmin>(`${this.apiUrl}/${id}/role`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
