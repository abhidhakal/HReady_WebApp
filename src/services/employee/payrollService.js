import api from '/src/api/api.js';

/**
 * Payroll Service (Employee)
 * Handles all payroll operations for employees
 */

// Get employee payroll history (matches EmployeePayroll.jsx)
export const getMyPayrollHistory = async () => {
  try {
    // First get the current user's employee ID
    const userResponse = await api.get('/employees/me');
    const employeeId = userResponse.data._id;
    
    const response = await api.get(`/payrolls/employee/${employeeId}/history`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my salary information (matches EmployeePayroll.jsx)
export const getMySalary = async () => {
  try {
    // First get the current user's employee ID
    const userResponse = await api.get('/employees/me');
    const employeeId = userResponse.data._id;
    
    const response = await api.get(`/salaries/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my bank account information (matches EmployeePayroll.jsx)
export const getMyBankAccount = async () => {
  try {
    // First get the current user's employee ID
    const userResponse = await api.get('/employees/me');
    const employeeId = userResponse.data._id;
    
    const response = await api.get(`/bank-accounts/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update my bank account (matches EmployeePayroll.jsx)
export const updateMyBankAccount = async (bankData) => {
  try {
    const response = await api.put(`/bank-accounts/${bankData._id}`, bankData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create my bank account (matches EmployeePayroll.jsx)
export const createMyBankAccount = async (bankData) => {
  try {
    // First get the current user's employee ID
    const userResponse = await api.get('/employees/me');
    const employeeId = userResponse.data._id;
    
    // Include employee ID in the request body
    const requestData = {
      ...bankData,
      employeeId: employeeId
    };
    
    const response = await api.post('/bank-accounts', requestData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Download payslip (matches EmployeePayroll.jsx)
export const downloadPayslip = async (payrollId) => {
  try {
    const response = await api.get(`/payrolls/${payrollId}/payslip`, {
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get payroll by ID
export const getMyPayrollById = async (payrollId) => {
  try {
    const response = await api.get(`/payrolls/${payrollId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get payslip preview
export const getPayslipPreview = async (payrollId) => {
  try {
    const response = await api.get(`/payrolls/${payrollId}/payslip/preview`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Request payslip
export const requestPayslip = async (payrollId) => {
  try {
    const response = await api.post(`/payrolls/${payrollId}/request-payslip`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 