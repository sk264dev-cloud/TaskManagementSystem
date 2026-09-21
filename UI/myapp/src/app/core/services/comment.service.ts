import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: number, comment: string): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/tasks/${taskId}/comments`, { comment });
  }
}
