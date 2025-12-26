import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:3000/api/admin';

    constructor(private http: HttpClient) { }

    getPendingTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pending-technicians`);
    }

    approveTechnician(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/approve-technician/${id}`, {});
    }

    rejectTechnician(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reject-technician/${id}`);
    }

    deleteStaff(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/staff/${id}`);
    }
}
