import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MaintenanceService } from '../../services/maintenance.service';
import { WorkOrderService } from '../../services/work-order.service';
import { MaintenanceRequest } from '../../models/models';

Chart.register(...registerables);

interface StaffPerformance {
    id: string;
    name: string;
    initials: string;
    role: string;
    assigned: number;
    completed: number;
    avgTime: number;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

    stats = {
        totalRequests: 0,
        pendingRequests: 0,
        resolvedRequests: 0,
        overdueRequests: 0,
        activeWorkOrders: 0,
        completedToday: 0,
        totalStaff: 5,
        totalResidents: 45
    };

    recentRequests: MaintenanceRequest[] = [];
    allRequests: MaintenanceRequest[] = [];

    staffPerformance: StaffPerformance[] = [
        { id: '1', name: 'John Smith', initials: 'JS', role: 'Plumber', assigned: 5, completed: 23, avgTime: 4.2 },
        { id: '2', name: 'Sarah Johnson', initials: 'SJ', role: 'Electrician', assigned: 3, completed: 18, avgTime: 3.8 },
        { id: '3', name: 'Mike Davis', initials: 'MD', role: 'HVAC Tech', assigned: 4, completed: 15, avgTime: 5.1 },
        { id: '4', name: 'Emily Brown', initials: 'EB', role: 'Maintenance', assigned: 6, completed: 31, avgTime: 3.5 },
        { id: '5', name: 'David Wilson', initials: 'DW', role: 'Maintenance', assigned: 2, completed: 12, avgTime: 4.0 }
    ];

    showAssignModal = false;
    selectedComplaint: MaintenanceRequest | null = null;
    selectedStaffId = '';

    private categoryChart?: Chart;
    private statusChart?: Chart;
    private trendChart?: Chart;

    categories = [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'hvac', label: 'HVAC' },
        { value: 'appliance', label: 'Appliance' },
        { value: 'security', label: 'Security' },
        { value: 'cleaning', label: 'Cleaning' },
        { value: 'painting', label: 'Painting' },
        { value: 'structural', label: 'Structural' },
        { value: 'other', label: 'Other' }
    ];

    constructor(
        private maintenanceService: MaintenanceService,
        private workOrderService: WorkOrderService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    loadData(): void {
        this.maintenanceService.getRequests().subscribe((requests: MaintenanceRequest[]) => {
            this.allRequests = requests;
            this.recentRequests = requests.slice(0, 10);
            this.calculateStats();

            // Update charts if already initialized
            if (this.categoryChart) {
                this.updateCharts();
            }
        });
    }

    calculateStats(): void {
        this.stats.totalRequests = this.allRequests.length;
        this.stats.pendingRequests = this.allRequests.filter(r => r.status === 'pending').length;
        this.stats.resolvedRequests = this.allRequests.filter(r => r.status === 'completed').length;

        // Calculate overdue (pending for more than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        this.stats.overdueRequests = this.allRequests.filter(r =>
            r.status === 'pending' && new Date(r.createdDate) < sevenDaysAgo
        ).length;
    }

    initializeCharts(): void {
        this.createCategoryChart();
        this.createStatusChart();
        this.createTrendChart();
    }

    createCategoryChart(): void {
        if (!this.categoryChartRef) return;

        const categoryCounts = this.categories.map(cat => ({
            label: cat.label,
            count: this.allRequests.filter(r => r.category === cat.value).length
        })).filter(c => c.count > 0);

        const config: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: categoryCounts.map(c => c.label),
                datasets: [{
                    label: 'Complaints',
                    data: categoryCounts.map(c => c.count),
                    backgroundColor: '#4A90E2',
                    borderRadius: 8,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        };

        this.categoryChart = new Chart(this.categoryChartRef.nativeElement, config);
    }

    createStatusChart(): void {
        if (!this.statusChartRef) return;

        const statusCounts = {
            pending: this.allRequests.filter(r => r.status === 'pending').length,
            assigned: this.allRequests.filter(r => r.status === 'assigned').length,
            inProgress: this.allRequests.filter(r => r.status === 'in-progress').length,
            completed: this.allRequests.filter(r => r.status === 'completed').length
        };

        const config: ChartConfiguration = {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Assigned', 'In Progress', 'Completed'],
                datasets: [{
                    data: [statusCounts.pending, statusCounts.assigned, statusCounts.inProgress, statusCounts.completed],
                    backgroundColor: ['#F5A623', '#4A90E2', '#9B59B6', '#7ED321'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, font: { size: 12 } }
                    }
                }
            }
        };

        this.statusChart = new Chart(this.statusChartRef.nativeElement, config);
    }

    createTrendChart(): void {
        if (!this.trendChartRef) return;

        // Generate last 30 days data
        const days = 30;
        const labels: string[] = [];
        const data: number[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            // Count requests created on this day
            const count = this.allRequests.filter(r => {
                const reqDate = new Date(r.createdDate);
                return reqDate.toDateString() === date.toDateString();
            }).length;
            data.push(count);
        }

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Complaints',
                    data: data,
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        };

        this.trendChart = new Chart(this.trendChartRef.nativeElement, config);
    }

    updateCharts(): void {
        if (this.categoryChart) {
            this.categoryChart.destroy();
            this.createCategoryChart();
        }
        if (this.statusChart) {
            this.statusChart.destroy();
            this.createStatusChart();
        }
        if (this.trendChart) {
            this.trendChart.destroy();
            this.createTrendChart();
        }
    }

    openAssignModal(complaint: MaintenanceRequest): void {
        this.selectedComplaint = complaint;
        this.showAssignModal = true;
    }

    closeAssignModal(): void {
        this.showAssignModal = false;
        this.selectedComplaint = null;
        this.selectedStaffId = '';
    }

    assignComplaint(): void {
        if (this.selectedComplaint && this.selectedStaffId) {
            const staff = this.staffPerformance.find(s => s.id === this.selectedStaffId);

            this.maintenanceService.updateRequest(this.selectedComplaint.id, {
                status: 'assigned',
                assignedTo: this.selectedStaffId
            }).subscribe({
                next: () => {
                    if (staff) {
                        staff.assigned++;
                    }
                    this.loadData();
                    this.closeAssignModal();
                    alert(`Complaint assigned to ${staff?.name} successfully!`);
                },
                error: (error) => {
                    console.error('Error assigning complaint:', error);
                    alert('Failed to assign complaint');
                }
            });
        }
    }

    getCategoryLabel(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : category;
    }

    formatStatus(status: string): string {
        return status.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
