import api from '/src/api/api.js';

/**
 * Payroll Service (Admin)
 * Handles all payroll management operations for admins
 */

// Get payroll statistics (matches PayrollDashboard.jsx)
export const getPayrollStats = async () => {
  try {
    const response = await api.get('/payrolls/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get all payrolls (matches PayrollDashboard.jsx)
export const getAllPayrolls = async () => {
  try {
    const response = await api.get('/payrolls');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get all salaries (matches PayrollDashboard.jsx)
export const getAllSalaries = async () => {
  try {
    const response = await api.get('/salaries');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Generate payroll (matches PayrollDashboard.jsx)
export const generatePayroll = async (month, year) => {
  try {
    const response = await api.post('/payrolls/generate', { month, year });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Approve payroll (matches PayrollDashboard.jsx)
export const approvePayroll = async (payrollId) => {
  try {
    const response = await api.put(`/payrolls/${payrollId}/approve`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Mark payroll as paid (matches PayrollDashboard.jsx)
export const markPayrollAsPaid = async (payrollId, paymentData) => {
  try {
    const response = await api.put(`/payrolls/${payrollId}/mark-paid`, paymentData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Bulk approve payrolls (matches PayrollDashboard.jsx)
export const bulkApprovePayrolls = async (payrollIds) => {
  try {
    const promises = payrollIds.map(id => api.put(`/payrolls/${id}/approve`));
    const responses = await Promise.all(promises);
    return { success: true, data: responses.map(r => r.data) };
  } catch (error) {
    return { success: false, error };
  }
};

// Bulk mark payrolls as paid (matches PayrollDashboard.jsx)
export const bulkMarkPayrollsAsPaid = async (payrollIds, paymentData) => {
  try {
    const promises = payrollIds.map(id => 
      api.put(`/payrolls/${id}/mark-paid`, paymentData)
    );
    const responses = await Promise.all(promises);
    return { success: true, data: responses.map(r => r.data) };
  } catch (error) {
    return { success: false, error };
  }
};

// Get payroll by ID
export const getPayrollById = async (payrollId) => {
  try {
    const response = await api.get(`/payrolls/${payrollId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create new payroll
export const createPayroll = async (payrollData) => {
  try {
    const response = await api.post('/payrolls', payrollData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update payroll
export const updatePayroll = async (payrollId, payrollData) => {
  try {
    const response = await api.put(`/payrolls/${payrollId}`, payrollData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete payroll
export const deletePayroll = async (payrollId) => {
  try {
    const response = await api.delete(`/payrolls/${payrollId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get payroll by employee
export const getPayrollByEmployee = async (employeeId, month, year) => {
  try {
    const response = await api.get(`/payrolls/employee/${employeeId}`, {
      params: { month, year }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get salary by employee
export const getSalaryByEmployee = async (employeeId) => {
  try {
    const response = await api.get(`/salaries/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update salary
export const updateSalary = async (employeeId, salaryData) => {
  try {
    const response = await api.put(`/salaries/employee/${employeeId}`, salaryData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create salary
export const createSalary = async (salaryData) => {
  try {
    const response = await api.post('/salaries', salaryData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete salary
export const deleteSalary = async (salaryId) => {
  try {
    const response = await api.delete(`/salaries/${salaryId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Bank Account Management (matches PayrollDashboard.jsx)

// Get employee bank account
export const getEmployeeBankAccount = async (employeeId) => {
  try {
    const response = await api.get(`/bank-accounts/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update bank account
export const updateBankAccount = async (bankAccountId, bankData) => {
  try {
    const response = await api.put(`/bank-accounts/${bankAccountId}`, bankData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create bank account
export const createBankAccount = async (bankData) => {
  try {
    const response = await api.post('/bank-accounts', bankData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Payroll Settings (matches PayrollDashboard.jsx)

// Get payroll budget
export const getPayrollBudget = async () => {
  try {
    const response = await api.get('/payroll-settings/payroll-budget');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update payroll budget
export const updatePayrollBudget = async (budget) => {
  try {
    const response = await api.put('/payroll-settings/payroll-budget', { budget: Number(budget) });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Generate payroll report
export const generatePayrollReport = async (reportType, filters = {}) => {
  try {
    const response = await api.get(`/payrolls/report/${reportType}`, { params: filters });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Export payroll data
export const exportPayrollData = async (format = 'pdf', filters = {}) => {
  try {
    const response = await api.get(`/payrolls/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Send payroll to employee
export const sendPayrollToEmployee = async (payrollId) => {
  try {
    const response = await api.post(`/payrolls/${payrollId}/send`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get payroll summary
export const getPayrollSummary = async (month, year) => {
  try {
    const response = await api.get('/payrolls/summary', {
      params: { month, year }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 