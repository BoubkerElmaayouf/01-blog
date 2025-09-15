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

  // // Fetch current user from backend (with JWT attached)
  // getCurrentUser(): Observable<User | null> {
  //   if (this.currentUser) {
  //     return of(this.currentUser); // return cached user
  //   }

  //   return this.http.get<User>(`${this.baseUrl}/me`).pipe(
  //     tap(user => this.currentUser = user),
  //     catchError(() => of(null)) // return null if error (unauthenticated)
  //   );
  // }
}
