import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:8080/api/post'

  constructor(private http: HttpClient) {}

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`)
  }
}
