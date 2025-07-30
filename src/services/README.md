# Services Layer

This directory contains all the business logic and API service functions for the HR management application. The services are organized by domain and user role to maintain clear separation of concerns.

## Structure

```
services/
├── auth/                    # Authentication services
│   └── authService.js      # Login, logout, user management
├── admin/                   # Admin-only services
│   ├── employeeService.js   # Employee management
│   ├── attendanceService.js # Attendance management
│   ├── leaveService.js      # Leave management
│   ├── payrollService.js    # Payroll management
│   └── profileService.js    # Admin profile management
├── employee/                # Employee-only services
│   ├── attendanceService.js # Employee attendance
│   ├── leaveService.js      # Employee leave requests
│   └── profileService.js    # Employee profile management
├── shared/                  # Shared services (both admin & employee)
│   ├── announcementService.js # Announcements
│   ├── taskService.js       # Task management
│   └── requestService.js    # Request management
└── index.js                 # Central export point
```

## Naming Conventions

To avoid naming conflicts, follow these conventions:

### Function Naming Patterns:
- **Admin functions**: Use `getAdmin*`, `updateAdmin*`, etc. (e.g., `getAdminProfile`, `getAdminAttendance`)
- **Employee functions**: Use `getMy*`, `updateMy*`, etc. (e.g., `getMyProfile`, `getMyAttendance`)
- **General functions**: Use descriptive names (e.g., `getAllEmployees`, `getEmployeeById`)
- **Role-specific functions**: Use role prefixes (e.g., `adminCheckIn`, `employeeCheckIn`)

### Avoided Conflicts:
- `getAllEmployees` - Only in employeeService.js
- `getAdminAttendance` - Admin attendance service
- `getMyAttendance` - Employee attendance service
- `getAdminProfile` - Admin profile service
- `getMyProfile` - Employee profile service
- `changeUserPassword` - Auth service (renamed from changePassword)
- `changePassword` - Employee profile service

## Usage

### Importing Services

```javascript
// Import specific services
import { loginUser, getMyProfile } from '/src/services/index.js';

// Or import from specific files
import { getAllEmployees } from '/src/services/admin/employeeService.js';
import { checkIn } from '/src/services/employee/attendanceService.js';
```

### Service Pattern

All services follow a consistent pattern:

```javascript
// Service function returns { success: boolean, data?: any, error?: any }
const result = await someServiceFunction(params);

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

### Example Usage in Components

```javascript
import { getMyProfile, updateMyProfile } from '/src/services/index.js';

const MyComponent = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getMyProfile();
    
    if (result.success) {
      setProfile(result.data);
    } else {
      console.error('Failed to fetch profile:', result.error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (profileData) => {
    setLoading(true);
    const result = await updateMyProfile(profileData);
    
    if (result.success) {
      setProfile(result.data);
      // Show success message
    } else {
      // Show error message
      console.error('Failed to update profile:', result.error);
    }
    setLoading(false);
  };

  // ... rest of component
};
```

## Benefits

1. **Separation of Concerns**: Business logic is separated from UI components
2. **Reusability**: Services can be used across multiple components
3. **Testability**: Services can be easily unit tested
4. **Maintainability**: Changes to API calls are centralized
5. **Error Handling**: Consistent error handling across the application
6. **Type Safety**: Clear return types and error handling

## Best Practices

1. **Always check success flag**: Always check the `success` property before using data
2. **Handle errors gracefully**: Provide user-friendly error messages
3. **Use loading states**: Show loading indicators during API calls
4. **Cache when appropriate**: Consider caching frequently accessed data
5. **Validate inputs**: Validate data before sending to API
6. **Use proper error boundaries**: Implement error boundaries in React components
7. **Follow naming conventions**: Use the established naming patterns to avoid conflicts

## Adding New Services

1. Create a new service file in the appropriate directory
2. Follow the established pattern with try-catch blocks
3. Return `{ success: true, data }` for success
4. Return `{ success: false, error }` for errors
5. **Check for naming conflicts** before exporting
6. Export the service from `index.js`
7. Add documentation to this README

### Conflict Prevention Checklist:
- [ ] Check if function name already exists in any service
- [ ] Use appropriate prefixes (Admin/My/Employee)
- [ ] Test imports to ensure no conflicts
- [ ] Update this README with new naming conventions 