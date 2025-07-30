/**
 * Services Index
 * Central export point for all services
 */

// Auth services
export * from './auth/authService.js';

// Admin services
export * from './admin/employeeService.js';
export * from './admin/attendanceService.js';
export * from './admin/leaveService.js';
export * from './admin/payrollService.js';
export * from './admin/profileService.js';

// Employee services
export * from './employee/attendanceService.js';
export * from './employee/leaveService.js';
export * from './employee/profileService.js';

// Shared services
export * from './shared/announcementService.js';
export * from './shared/taskService.js';
export * from './shared/requestService.js'; 