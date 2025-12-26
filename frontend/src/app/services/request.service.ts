import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:3000/api/maintenance';

  constructor(private http: HttpClient) { }

  createRequest(requestData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/new`, requestData);
  }

  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  updateStatus(id: number, status: string, notes?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status, notes });
  }

  assignTechnician(id: number, technicianId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign`, { technicianId });
  }

  resolveRequest(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/resolve`, formData);
  }

  submitFeedback(id: number, feedback: { feedback_rating: number, feedback_comments?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/feedback`, feedback);
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
