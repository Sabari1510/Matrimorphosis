import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
    roles: string[];
}

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
    currentUser: User | null = null;
    showUserMenu = false;

    menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/admin/dashboard',
            roles: ['admin']
        },
        {
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/technician/dashboard',
            roles: ['staff']
        },
        {
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/resident-dashboard',
            roles: ['resident']
        },
        {
            label: 'Requests',
            icon: 'requests',
            route: '/maintenance/history',
            roles: ['admin', 'staff', 'resident']
        },
        {
            label: 'New Request',
            icon: 'add',
            route: '/maintenance/new',
            roles: ['resident']
        }
    ];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    }

    get filteredMenuItems(): MenuItem[] {
        if (!this.currentUser) return [];
        return this.menuItems.filter(item =>
            item.roles.includes(this.currentUser!.role)
        );
    }

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    getIconPath(icon: string): string {
        const icons: { [key: string]: string } = {
            dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
            requests: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
            add: 'M12 5v14 M5 12h14',
            work: 'M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M10 5h4v2h-4V5z',
            calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z M5 20V10h14v10H5z M7 12h2v2H7v-2z M11 12h2v2h-2v-2z M15 12h2v2h-2v-2z M7 16h2v2H7v-2z M11 16h2v2h-2v-2z M15 16h2v2h-2v-2z',
            reports: 'M18 20V10 M12 20V4 M6 20v-6'
        };
        return icons[icon] || icons['dashboard'];
    }
}
