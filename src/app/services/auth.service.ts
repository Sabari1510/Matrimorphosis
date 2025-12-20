import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    // Mock users for demonstration
    private mockUsers: User[] = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@maintenance.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '555-0100'
        },
        {
            id: '2',
            username: 'staff',
            email: 'staff@maintenance.com',
            role: 'staff',
            firstName: 'John',
            lastName: 'Technician',
            phoneNumber: '555-0101'
        },
        {
            id: '3',
            username: 'resident',
            email: 'resident@maintenance.com',
            role: 'resident',
            firstName: 'Jane',
            lastName: 'Resident',
            apartmentNumber: '101',
            phoneNumber: '555-0102'
        }
    ];

    constructor() {
        const storedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<User | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string): Observable<User> {
        return new Observable(observer => {
            // Mock authentication - in production, this would call an API
            const user = this.mockUsers.find(u => u.username === username);

            if (user && password === 'password') {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                observer.next(user);
                observer.complete();
            } else {
                observer.error('Invalid username or password');
            }
        });
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return this.currentUserValue !== null;
    }

    hasRole(role: string): boolean {
        return this.currentUserValue?.role === role;
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.includes(this.currentUserValue?.role || '');
    }
}
