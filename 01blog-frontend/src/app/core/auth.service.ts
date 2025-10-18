import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface User {
  id: number;
  firstName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; // backend URL
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  // Register user
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  // Login user and store JWT in localStorage
  login(data: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    this.currentUser = null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isValidToken(): Observable<{ isValid: boolean; role: string | null }> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of({ isValid: false, role: null });
    }

    return this.http.post<{ isValid: boolean; role: string | null }>(
      `${this.baseUrl}/isValidtoken?Authorization=Bearer ${token}`,
      {}
    );
  }

}
