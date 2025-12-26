import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient) { }

    getTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians`);
    }

    getTechniciansBySpecialization(specialization: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/technicians/${specialization}`);
    }

    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }
}
