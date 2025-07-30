import api from '/src/api/api.js';

/**
 * Employee Service (Admin)
 * Handles all employee management operations for admins
 */

// Get all employees
export const getAllEmployees = async () => {
  try {
    const response = await api.get('/employees');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get employee by ID
export const getEmployeeById = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create new employee
export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post('/employees', employeeData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update employee
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await api.put(`/employees/${employeeId}`, employeeData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete employee
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await api.delete(`/employees/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get employee leaves
export const getEmployeeLeaves = async (employeeId) => {
  try {
    const response = await api.get(`/leaves/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get employee tasks
export const getEmployeeTasks = async (employeeId) => {
  try {
    const response = await api.get(`/tasks/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get employee payroll
export const getEmployeePayroll = async (employeeId, month, year) => {
  try {
    const response = await api.get(`/payrolls/employee/${employeeId}`, {
      params: { month, year }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Upload employee profile picture
export const uploadEmployeeProfilePicture = async (employeeId, file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.put(`/employees/${employeeId}/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get employee statistics
export const getEmployeeStats = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/stats`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 