import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchUserPostResponse {
  userId: number;
  firstName: string;
  lastName: string;
  profilePic: string;
  bio: string;
  postId: number;
  title: string;
  topic: string;
  banner: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
    private apiUrl = 'http://localhost:8080/api/post';
    
    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || '';
        return new HttpHeaders({ 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        });
    }

    searchBar(query: string): Observable<SearchUserPostResponse[]> {
        return this.http.get<SearchUserPostResponse[]>(
            `${this.apiUrl}/search?query=${query}`, 
            { headers: this.getAuthHeaders() }
        );
    }
}
