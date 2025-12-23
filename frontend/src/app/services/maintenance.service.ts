import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private apiUrl = 'http://localhost:3000/api/requests';

  constructor(private http: HttpClient) {}

  createRequest(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
  getRequestsByResident(residentId: number) {
    return this.http.get(`${this.apiUrl}/resident/${residentId}`);
  }
  getRequestsByTechnician(technicianId: number) {
    return this.http.get(`${this.apiUrl}/technician/${technicianId}`);
  }

  updateRequestStatus(requestId: number, status: string) {
    return this.http.put(`${this.apiUrl}/${requestId}/status`, { status });
  }
  getAllRequests() {
    return this.http.get<any>('http://localhost:3000/api/requests/resident/3');
    // TEMP: reuse resident endpoint for demo
  }

  assignTechnician(requestId: number, technicianId: number) {
    return this.http.put(
      `http://localhost:3000/api/requests/${requestId}/assign`,
      { technicianId }
    );
  }
  submitFeedback(requestId: number, rating: number) {
    return this.http.post(`${this.apiUrl}/${requestId}/feedback`, { rating });
  }
}
