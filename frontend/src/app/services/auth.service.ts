import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient, private router: Router) {
        const userStr = localStorage.getItem('user');
        this.currentUserSubject = new BehaviorSubject<any>(userStr ? JSON.parse(userStr) : null);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    get currentUserValue() {
        return this.currentUserSubject.value;
    }

    register(userData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    login(credentials: any): Observable<any> {
        return this.http.post<{ token: string, user: any }>(`${this.apiUrl}/login`, credentials)
            .pipe(tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
            }));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getUser() {
        return this.currentUserSubject.value; // simplified
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUserRole(): string {
        const user = this.getUser();
        return user ? user.role : '';
    }
}
