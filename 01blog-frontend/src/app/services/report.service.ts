import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportData } from '../shared/components/reportpopup/repop.component';

export interface Report {
  id: number;
  reason: string;
  description: string;
  type: string; // "GENERAL" | "POST" | "PROFILE"
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportUrl = 'http://localhost:8080/api/report';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Create report ---
  submitReport(reportData: ReportData): Observable<any> {
    return this.http.post(`${this.reportUrl}/create`, reportData, {
      headers: this.getAuthHeaders()
    });
  }

  // --- Get all reports ---
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.reportUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  // --- Get a single report ---
  getReportById(reportId: number): Observable<Report> {
    return this.http.get<Report>(`${this.reportUrl}/${reportId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // --- Delete a report ---
  deleteReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.reportUrl}/${reportId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
