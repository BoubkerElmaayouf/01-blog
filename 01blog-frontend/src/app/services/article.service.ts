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
  id: number;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:8080/api/post';

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
}
