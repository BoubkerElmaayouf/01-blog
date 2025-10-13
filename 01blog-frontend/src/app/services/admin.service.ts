import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Post, Report } from '../../app/features/admin/admin.component';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/unban`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  // Posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/posts`);
  }

  removePost(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/remove`, {});
  }

  restorePost(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/restore`, {});
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}`);
  }

  // Reports
  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/reports`);
  }

  resolveReport(reportId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reports/${reportId}/resolve`, {});
  }

  dismissReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reports/${reportId}`);
  }
}
