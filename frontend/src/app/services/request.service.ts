import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:3000/api/requests';

  constructor(private http: HttpClient) { }

  createRequest(requestData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, requestData);
  }

  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateStatus(id: number, status: string, notes?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status, notes });
  }

  assignTechnician(id: number, technicianId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign`, { technicianId });
  }
}
