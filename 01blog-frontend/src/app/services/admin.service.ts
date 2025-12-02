import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces (reuse same ones from AdminComponent)
export interface User {
  id: number;
  username: string;
  email: string;
  joinDate: Date | null;
  postsCount: number;
  status: 'active' | 'banned';
}

export interface Post {
  id: number;
  title: string;
  author: string;
  publishDate: Date;
  views: number;
  status: 'published' | 'hidden' | 'removed';
}

export interface Report {
  id: number;
  reporterUsername: string;
  reportedItem: string;
  itemType: 'profile' | 'post';
  reason: string;
  reportDate: Date;
  status: 'pending' | 'resolved';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // ================== Helpers ==================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ================== USERS ==================
  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(data =>
        data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          joinDate: user.joinDate ? new Date(user.joinDate) : null,
          postsCount: user.postsCount,
          status: user.status as 'active' | 'banned'
        }))
      )
    );
  }

  BanMangment(id: number, userStatus: any) : Observable<any> {
    if (userStatus == "banned") {
      return this.banUser(id);
    } else {
      return this.unbanUser(id);
    }
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/ban/${userId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/unban/${userId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${userId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // ================== POSTS ==================
  getPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(data =>
        data.map(post => ({
          id: post.id,
          title: post.title,
          author: post.author,
          publishDate: new Date(post.publishDate),
          views: post.views,
          status: post.status as 'published' | 'hidden' | 'removed'
        }))
      )
    );
  }

  removePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/remove/${postId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  restorePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/restore/${postId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  hidePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/hide/${postId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${postId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // ================== REPORTS ==================
  getReports(): Observable<Report[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(data =>
        data.map(report => ({
          id: report.id,
          reporterUsername: report.reporterUsername,
          reportedItem: report.reportedItem,
          itemType: report.itemType as 'profile' | 'post',
          reason: report.reason,
          reportDate: new Date(report.reportDate),
          status: report.status as 'pending' | 'resolved'
        }))
      )
    );
  }

  resolveReport(reportId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/resolve/${reportId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  dismissReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reports/${reportId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}
