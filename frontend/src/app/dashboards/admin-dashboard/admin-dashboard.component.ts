import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
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

    staffPerformance: StaffPerformance[] = []; // Loaded from database
    pendingTechnicians: any[] = []; // Technicians awaiting approval

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
        private requestService: RequestService,
        private userService: UserService,
        private adminService: AdminService
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
        this.requestService.getRequests().subscribe((requests: any[]) => {
            this.allRequests = requests as MaintenanceRequest[];
            this.recentRequests = this.allRequests.slice(0, 10);
            this.calculateStats();

            // Update charts if already initialized
            if (this.categoryChart) {
                this.updateCharts();
            }
        });

        // Load real technicians from database
        this.userService.getTechnicians().subscribe({
            next: (technicians) => {
                this.staffPerformance = technicians.map(tech => {
                    const assignedRequests = this.allRequests.filter(r => r.technician_id === tech.id);
                    const completedRequests = assignedRequests.filter(r => r.status === 'Resolved');

                    return {
                        id: tech.id.toString(),
                        name: tech.name,
                        initials: this.getInitials(tech.name),
                        role: 'Technician',
                        assigned: assignedRequests.length,
                        completed: completedRequests.length,
                        avgTime: 0
                    };
                });
            },
            error: (err) => console.error('Error loading technicians:', err)
        });

        // Load pending technicians for approval
        this.adminService.getPendingTechnicians().subscribe({
            next: (pending) => {
                this.pendingTechnicians = pending;
            },
            error: (err) => console.error('Error loading pending technicians:', err)
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    calculateStats(): void {
        this.stats.totalRequests = this.allRequests.length;
        this.stats.pendingRequests = this.allRequests.filter(r => r.status === 'New').length;
        this.stats.resolvedRequests = this.allRequests.filter(r => r.status === 'Resolved').length;

        // Calculate overdue (pending for more than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        this.stats.overdueRequests = this.allRequests.filter(r =>
            r.status === 'New' && new Date(r.created_at) < sevenDaysAgo
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
            pending: this.allRequests.filter(r => r.status === 'New').length,
            assigned: this.allRequests.filter(r => r.status === 'Assigned').length,
            inProgress: this.allRequests.filter(r => r.status === 'In-Progress').length,
            completed: this.allRequests.filter(r => r.status === 'Resolved').length
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
                const reqDate = new Date(r.created_at);
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
            // const staff = this.staffPerformance.find(s => s.id === this.selectedStaffId); 
            // Mock staff logic for now as we don't have real staff performance data linked yet

            this.requestService.assignTechnician(this.selectedComplaint.id, parseInt(this.selectedStaffId)).subscribe({
                next: () => {
                    this.loadData();
                    this.closeAssignModal();
                    alert(`Complaint assigned successfully!`);
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

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    approveTechnician(id: number): void {
        if (confirm('Approve this technician?')) {
            this.adminService.approveTechnician(id).subscribe({
                next: () => {
                    this.pendingTechnicians = this.pendingTechnicians.filter(t => t.id !== id);
                    alert('Technician approved successfully!');
                    this.loadData(); // Reload to update staff list
                },
                error: (err) => {
                    console.error('Error approving technician:', err);
                    alert('Failed to approve technician');
                }
            });
        }
    }

    rejectTechnician(id: number): void {
        if (confirm('Reject and delete this technician account?')) {
            this.adminService.rejectTechnician(id).subscribe({
                next: () => {
                    this.pendingTechnicians = this.pendingTechnicians.filter(t => t.id !== id);
                    alert('Technician rejected');
                },
                error: (err) => {
                    console.error('Error rejecting technician:', err);
                    alert('Failed to reject technician');
                }
            });
        }
    }
}
