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
}
