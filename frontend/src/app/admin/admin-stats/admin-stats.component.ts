import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AdminService } from '../../services/admin.service';

Chart.register(...registerables);

@Component({
    selector: 'app-admin-stats',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent],
    templateUrl: './admin-stats.component.html',
    styleUrl: './admin-stats.component.css'
})
export class AdminStatsComponent implements OnInit, AfterViewInit {
    @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

    analyticsData: any = null;
    technicianStats: any[] = [];
    loading = true;

    private categoryChart?: Chart;
    private statusChart?: Chart;
    private trendChart?: Chart;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadAnalytics();
    }

    ngAfterViewInit(): void {
        // Charts will be initialized after data loads
    }

    loadAnalytics(): void {
        this.loading = true;
        this.adminService.getAnalytics().subscribe({
            next: (data) => {
                this.analyticsData = data;
                this.loading = false;
                setTimeout(() => this.initializeCharts(), 100);
            },
            error: (err) => {
                console.error('Error loading analytics:', err);
                this.loading = false;
            }
        });

        this.adminService.getTechnicianStats().subscribe({
            next: (stats) => {
                this.technicianStats = stats;
            },
            error: (err) => console.error('Error loading technician stats:', err)
        });
    }

    initializeCharts(): void {
        this.createCategoryChart();
        this.createStatusChart();
        this.createTrendChart();
    }

    createCategoryChart(): void {
        if (!this.categoryChartRef || !this.analyticsData) return;

        const data = this.analyticsData.byCategory;
        const config: ChartConfiguration | any = {
            type: 'bar',
            data: {
                labels: data.map((c: any) => c.category),
                datasets: [{
                    label: 'Complaints',
                    data: data.map((c: any) => parseInt(c.count)),
                    backgroundColor: (context: any) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return '#3b82f6';
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, '#3b82f6');
                        gradient.addColorStop(1, '#60a5fa');
                        return gradient;
                    },
                    borderRadius: 10,
                    barThickness: 32,
                    hoverBackgroundColor: '#93c5fd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false
                    }
                } as any,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        border: { display: false },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } as any,
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } as any
                        }
                    }
                } as any
            }
        };

        if (this.categoryChart) this.categoryChart.destroy();
        this.categoryChart = new Chart(this.categoryChartRef.nativeElement, config);
    }

    createStatusChart(): void {
        if (!this.statusChartRef || !this.analyticsData) return;

        const statuses = ['New', 'Assigned', 'In-Progress', 'Resolved'];
        const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981'];

        const dataMap = new Map();
        this.analyticsData.byStatus.forEach((s: any) => dataMap.set(s.status, parseInt(s.count)));
        const data = statuses.map(s => dataMap.get(s) || 0);

        const config: ChartConfiguration | any = {
            type: 'doughnut',
            data: {
                labels: statuses,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15,
                    borderRadius: 8,
                    spacing: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 20,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' } as any,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        cornerRadius: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        };

        if (this.statusChart) this.statusChart.destroy();
        this.statusChart = new Chart(this.statusChartRef.nativeElement, config);
    }

    createTrendChart(): void {
        if (!this.trendChartRef || !this.analyticsData) return;

        // Fill missing dates for the last 7 days
        const days = 7;
        const trendData = [];
        const labels = [];

        // Create a map of existing daily trends from API
        const trendMap = new Map();
        this.analyticsData.dailyTrends.forEach((d: any) => {
            // Normalize date to local date string for comparison
            const dateKey = new Date(d.date).toLocaleDateString();
            trendMap.set(dateKey, parseInt(d.count));
        });

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toLocaleDateString();
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            labels.push(label);
            trendData.push(trendMap.get(dateKey) || 0);
        }

        const config: ChartConfiguration | any = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Requests',
                    data: trendData,
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    backgroundColor: (context: any) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return 'transparent';
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        cornerRadius: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                } as any,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        border: { display: false },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } as any,
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } as any
                        }
                    }
                } as any
            }
        };

        if (this.trendChart) this.trendChart.destroy();
        this.trendChart = new Chart(this.trendChartRef.nativeElement, config);
    }
}
