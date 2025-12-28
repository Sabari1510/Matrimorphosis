import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient) { }

    /** Get verified technicians (for assignment) */
    getTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians`);
    }

    /** Get ALL technicians including pending (for manage staff) */
    getAllTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians/all`);
    }

    /** Get pending technicians waiting for admin approval */
    getPendingTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians/pending`);
    }

    /** Verify (approve) a technician */
    verifyTechnician(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/technicians/${id}/verify`, {});
    }

    getTechniciansBySpecialization(specialization: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians/specialization/${specialization}`);
    }

    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }
}
