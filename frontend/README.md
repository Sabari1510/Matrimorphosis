# Digital Maintenance Tracker for Apartments & Buildings

A comprehensive Angular 18 application for managing apartment and building maintenance requests, work orders, and preventive maintenance scheduling.

## Features

### 🏠 For Residents
- Submit maintenance requests with detailed descriptions
- Track request status in real-time
- View request history
- Priority-based request submission
- Category-specific requests (Plumbing, Electrical, HVAC, etc.)

### 🔧 For Maintenance Staff
- View assigned work orders
- Update work order status
- Add notes and completion details
- Track time and materials
- Manage daily tasks

### 👨‍💼 For Administrators
- Complete oversight of all requests and work orders
- Assign work orders to staff members
- View analytics and reports
- Manage preventive maintenance schedules
- Monitor response times and completion rates

## Technology Stack

- **Framework**: Angular 18
- **Styling**: Pure CSS (no frameworks)
- **State Management**: RxJS
- **Routing**: Angular Router
- **Forms**: Angular Forms (Template-driven)

## Project Structure

```
maintenance-tracker/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── login/              # Login component
│   │   ├── dashboards/
│   │   │   ├── admin-dashboard/    # Admin dashboard
│   │   │   ├── resident-dashboard/ # Resident dashboard
│   │   │   └── staff-dashboard/    # Staff dashboard
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Route protection
│   │   ├── maintenance/
│   │   │   ├── request-form/       # New request form
│   │   │   ├── request-list/       # Request list view
│   │   │   └── request-details/    # Request details
│   │   ├── models/
│   │   │   └── models.ts           # TypeScript interfaces
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Authentication
│   │   │   ├── maintenance.service.ts
│   │   │   ├── work-order.service.ts
│   │   │   └── notification.service.ts
│   │   ├── shared/
│   │   │   ├── navbar/             # Navigation bar
│   │   │   └── sidebar/            # Sidebar navigation
│   │   ├── work-orders/            # Work order components
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   └── styles.css                  # Global styles
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Navigate to the project directory:
```bash
cd maintenance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to:
```
http://localhost:4200
```

## Demo Credentials

The application includes mock authentication for demonstration purposes:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| Maintenance Staff | staff | password |
| Resident | resident | password |

## Key Features Implemented

### ✅ Authentication & Authorization
- Role-based access control
- Route guards for protected pages
- User session management

### ✅ Maintenance Request Management
- Create new requests
- View request history
- Track request status
- Priority and category classification

### ✅ Dashboard Analytics
- Real-time statistics
- Status-based filtering
- Recent activity tracking

### ✅ Modern UI/UX
- Responsive design for all devices
- Gradient backgrounds and modern aesthetics
- Smooth animations and transitions
- Intuitive navigation

### ✅ Status Tracking
- Pending
- Assigned
- In Progress
- Completed
- Cancelled

### ✅ Priority Levels
- Low
- Medium
- High
- Urgent

## Development

### Build for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

### Code Scaffolding

Generate a new component:
```bash
ng generate component component-name
```

Generate a new service:
```bash
ng generate service service-name
```

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications using WebSockets
- [ ] Image upload for maintenance requests
- [ ] Email notifications
- [ ] Mobile app (Ionic/Capacitor)
- [ ] Advanced reporting and analytics
- [ ] Preventive maintenance scheduling
- [ ] Vendor management
- [ ] Cost tracking and budgeting
- [ ] Multi-building support

## Design System

The application uses a comprehensive CSS design system with:

- **Color Palette**: Primary, secondary, and accent colors
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing scale
- **Components**: Reusable UI components
- **Utilities**: Helper classes for common patterns

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a capstone project. For suggestions or improvements, please contact the project maintainer.

## License

This project is created for educational purposes as part of a capstone project.

## Contact

For questions or support, please contact the development team.

---

**Built with ❤️ using Angular 18**
