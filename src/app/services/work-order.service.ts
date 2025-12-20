import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WorkOrder, WorkOrderNote } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class WorkOrderService {
    private workOrdersSubject = new BehaviorSubject<WorkOrder[]>(this.getMockWorkOrders());
    public workOrders$ = this.workOrdersSubject.asObservable();

    constructor() { }

    getWorkOrders(): Observable<WorkOrder[]> {
        return this.workOrders$;
    }

    getWorkOrderById(id: string): Observable<WorkOrder | undefined> {
        return of(this.workOrdersSubject.value.find(wo => wo.id === id));
    }

    getWorkOrdersByStaff(staffId: string): Observable<WorkOrder[]> {
        return of(this.workOrdersSubject.value.filter(wo => wo.assignedTo === staffId));
    }

    createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdDate' | 'notes'>): Observable<WorkOrder> {
        const newWorkOrder: WorkOrder = {
            ...workOrder,
            id: this.generateId(),
            createdDate: new Date(),
            notes: []
        };

        const currentWorkOrders = this.workOrdersSubject.value;
        this.workOrdersSubject.next([...currentWorkOrders, newWorkOrder]);

        return of(newWorkOrder).pipe(delay(500));
    }

    updateWorkOrder(id: string, updates: Partial<WorkOrder>): Observable<WorkOrder> {
        const currentWorkOrders = this.workOrdersSubject.value;
        const index = currentWorkOrders.findIndex(wo => wo.id === id);

        if (index !== -1) {
            const updatedWorkOrder = {
                ...currentWorkOrders[index],
                ...updates
            };

            currentWorkOrders[index] = updatedWorkOrder;
            this.workOrdersSubject.next([...currentWorkOrders]);

            return of(updatedWorkOrder).pipe(delay(500));
        }

        throw new Error('Work order not found');
    }

    addNote(workOrderId: string, note: Omit<WorkOrderNote, 'id' | 'workOrderId' | 'createdDate'>): Observable<WorkOrderNote> {
        const newNote: WorkOrderNote = {
            ...note,
            id: this.generateNoteId(),
            workOrderId,
            createdDate: new Date()
        };

        const currentWorkOrders = this.workOrdersSubject.value;
        const workOrder = currentWorkOrders.find(wo => wo.id === workOrderId);

        if (workOrder) {
            workOrder.notes.push(newNote);
            this.workOrdersSubject.next([...currentWorkOrders]);
            return of(newNote).pipe(delay(500));
        }

        throw new Error('Work order not found');
    }

    private generateId(): string {
        return 'WO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private generateNoteId(): string {
        return 'NOTE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private getMockWorkOrders(): WorkOrder[] {
        return [
            {
                id: 'WO-001',
                requestId: 'REQ-001',
                title: 'Leaking Kitchen Faucet',
                description: 'Replace worn-out washer and check for other issues.',
                category: 'plumbing',
                priority: 'medium',
                status: 'in-progress',
                assignedTo: '2',
                assignedStaffName: 'John Technician',
                createdDate: new Date('2024-12-16'),
                scheduledDate: new Date('2024-12-17'),
                estimatedHours: 2,
                notes: [
                    {
                        id: 'NOTE-001',
                        workOrderId: 'WO-001',
                        userId: '2',
                        userName: 'John Technician',
                        note: 'Inspected the faucet. Need to order replacement parts.',
                        createdDate: new Date('2024-12-16')
                    }
                ]
            },
            {
                id: 'WO-002',
                requestId: 'REQ-002',
                title: 'Air Conditioning Not Working',
                description: 'Diagnose and repair AC unit cooling issue.',
                category: 'hvac',
                priority: 'high',
                status: 'assigned',
                assignedTo: '2',
                assignedStaffName: 'John Technician',
                createdDate: new Date('2024-12-17'),
                scheduledDate: new Date('2024-12-19'),
                estimatedHours: 3,
                notes: []
            },
            {
                id: 'WO-003',
                requestId: 'REQ-004',
                title: 'Dishwasher Not Draining',
                description: 'Clear drain blockage and test dishwasher.',
                category: 'appliance',
                priority: 'low',
                status: 'completed',
                assignedTo: '2',
                assignedStaffName: 'John Technician',
                createdDate: new Date('2024-12-10'),
                scheduledDate: new Date('2024-12-11'),
                completedDate: new Date('2024-12-12'),
                estimatedHours: 1.5,
                actualHours: 1,
                notes: [
                    {
                        id: 'NOTE-002',
                        workOrderId: 'WO-003',
                        userId: '2',
                        userName: 'John Technician',
                        note: 'Cleared food debris from drain. Tested and working properly.',
                        createdDate: new Date('2024-12-12')
                    }
                ]
            }
        ];
    }
}
