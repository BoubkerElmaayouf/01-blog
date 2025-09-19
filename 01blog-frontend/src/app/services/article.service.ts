import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id: number;
  title: string;
  topic: string;
  banner: string;
  description: string;
  videos: any[];
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

export interface Comment {
  user: any;
  id: number;
  content: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  profilePic: string;
}


@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:8080/api/post';
  private UserUrl = 'http://localhost:8080/api/auth/';

  constructor(private http: HttpClient) {}

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  addComment(postId: number, content: string): Observable<Comment> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comment`, { content }, { headers });
  }

  getUserInfo(): Observable<UserProfile> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<UserProfile>(`${this.UserUrl}user`, { headers });
  }

}