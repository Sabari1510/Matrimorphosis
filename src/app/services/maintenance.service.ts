import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MaintenanceRequest } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private requestsSubject = new BehaviorSubject<MaintenanceRequest[]>(this.getMockRequests());
    public requests$ = this.requestsSubject.asObservable();

    constructor() { }

    getRequests(): Observable<MaintenanceRequest[]> {
        return this.requests$;
    }

    getRequestById(id: string): Observable<MaintenanceRequest | undefined> {
        return of(this.requestsSubject.value.find(r => r.id === id));
    }

    getRequestsByResident(residentId: string): Observable<MaintenanceRequest[]> {
        return of(this.requestsSubject.value.filter(r => r.residentId === residentId));
    }

    createRequest(request: Omit<MaintenanceRequest, 'id' | 'createdDate' | 'updatedDate'>): Observable<MaintenanceRequest> {
        const newRequest: MaintenanceRequest = {
            ...request,
            id: this.generateId(),
            createdDate: new Date(),
            updatedDate: new Date(),
            status: 'pending'
        };

        const currentRequests = this.requestsSubject.value;
        this.requestsSubject.next([...currentRequests, newRequest]);

        return of(newRequest).pipe(delay(500));
    }

    updateRequest(id: string, updates: Partial<MaintenanceRequest>): Observable<MaintenanceRequest> {
        const currentRequests = this.requestsSubject.value;
        const index = currentRequests.findIndex(r => r.id === id);

        if (index !== -1) {
            const updatedRequest = {
                ...currentRequests[index],
                ...updates,
                updatedDate: new Date()
            };

            currentRequests[index] = updatedRequest;
            this.requestsSubject.next([...currentRequests]);

            return of(updatedRequest).pipe(delay(500));
        }

        throw new Error('Request not found');
    }

    deleteRequest(id: string): Observable<boolean> {
        const currentRequests = this.requestsSubject.value;
        const filtered = currentRequests.filter(r => r.id !== id);
        this.requestsSubject.next(filtered);
        return of(true).pipe(delay(500));
    }

    private generateId(): string {
        return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private getMockRequests(): MaintenanceRequest[] {
        return [
            {
                id: 'REQ-001',
                title: 'Leaking Kitchen Faucet',
                description: 'The kitchen faucet has been dripping constantly for the past two days.',
                category: 'plumbing',
                priority: 'medium',
                status: 'in-progress',
                residentId: '3',
                residentName: 'Jane Resident',
                apartmentNumber: '101',
                createdDate: new Date('2024-12-15'),
                updatedDate: new Date('2024-12-16'),
                assignedTo: '2',
                workOrderId: 'WO-001'
            },
            {
                id: 'REQ-002',
                title: 'Air Conditioning Not Working',
                description: 'AC unit is not cooling properly. Room temperature is 80°F.',
                category: 'hvac',
                priority: 'high',
                status: 'assigned',
                residentId: '3',
                residentName: 'Jane Resident',
                apartmentNumber: '101',
                createdDate: new Date('2024-12-17'),
                updatedDate: new Date('2024-12-17'),
                assignedTo: '2',
                workOrderId: 'WO-002'
            },
            {
                id: 'REQ-003',
                title: 'Broken Light Fixture',
                description: 'Ceiling light in bedroom is flickering and making buzzing noise.',
                category: 'electrical',
                priority: 'medium',
                status: 'pending',
                residentId: '3',
                residentName: 'Jane Resident',
                apartmentNumber: '101',
                createdDate: new Date('2024-12-18'),
                updatedDate: new Date('2024-12-18')
            },
            {
                id: 'REQ-004',
                title: 'Dishwasher Not Draining',
                description: 'Water remains at the bottom of the dishwasher after cycle completes.',
                category: 'appliance',
                priority: 'low',
                status: 'completed',
                residentId: '3',
                residentName: 'Jane Resident',
                apartmentNumber: '101',
                createdDate: new Date('2024-12-10'),
                updatedDate: new Date('2024-12-12'),
                completedDate: new Date('2024-12-12'),
                assignedTo: '2',
                workOrderId: 'WO-003'
            }
        ];
    }
}
