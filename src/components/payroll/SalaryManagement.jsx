import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Toast from '../common/Toast';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [expandedSalaryId, setExpandedSalaryId] = useState(null); // For accordion
  const [salaryForm, setSalaryForm] = useState({
    employee: '',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    mealAllowance: '',
    medicalAllowance: '',
    otherAllowance: '',
    taxDeduction: '15', // Default 15% tax
    insuranceDeduction: '5', // Default 5% insurance
    pensionDeduction: '',
    otherDeduction: '',
    currency: 'Rs.', // Default to Nepali Rupees
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salariesRes, employeesRes] = await Promise.all([
        api.get('/salaries'),
        api.get('/employees')
      ]);
      setSalaries(salariesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Calculate gross salary
      const basicSalary = parseFloat(salaryForm.basicSalary) || 0;
      const totalAllowances = 
        (parseFloat(salaryForm.housingAllowance) || 0) +
        (parseFloat(salaryForm.transportAllowance) || 0) +
        (parseFloat(salaryForm.mealAllowance) || 0) +
        (parseFloat(salaryForm.medicalAllowance) || 0) +
        (parseFloat(salaryForm.otherAllowance) || 0);
      
      const grossSalary = basicSalary + totalAllowances;
      
      // Calculate tax deduction as percentage of gross salary
      const taxPercentage = parseFloat(salaryForm.taxDeduction) || 0;
      const taxAmount = grossSalary * (taxPercentage / 100);
      
      // Calculate insurance deduction as percentage of basic salary
      const insurancePercentage = parseFloat(salaryForm.insuranceDeduction) || 0;
      const insuranceAmount = basicSalary * (insurancePercentage / 100);
      
      // Calculate other deductions
      const otherDeductions = 
        (parseFloat(salaryForm.pensionDeduction) || 0) +
        (parseFloat(salaryForm.otherDeduction) || 0);
      
      // Calculate net salary
      const netSalary = grossSalary - taxAmount - insuranceAmount - otherDeductions;
      
      const salaryData = {
        ...salaryForm,
        basicSalary: basicSalary,
        allowances: {
          housing: parseFloat(salaryForm.housingAllowance) || 0,
          transport: parseFloat(salaryForm.transportAllowance) || 0,
          meal: parseFloat(salaryForm.mealAllowance) || 0,
          medical: parseFloat(salaryForm.medicalAllowance) || 0,
          other: parseFloat(salaryForm.otherAllowance) || 0
        },
        deductions: {
          tax: taxAmount, // Send calculated tax amount
          insurance: insuranceAmount, // Send calculated insurance amount
          pension: parseFloat(salaryForm.pensionDeduction) || 0,
          other: parseFloat(salaryForm.otherDeduction) || 0
        },
        taxPercentage: taxPercentage, // Store the percentage for reference
        insurancePercentage: insurancePercentage, // Store the percentage for reference
        grossSalary: grossSalary,
        netSalary: netSalary,
        totalAllowances: totalAllowances,
        totalDeductions: taxAmount + insuranceAmount + otherDeductions
      };

      if (editingSalary) {
        await api.put(`/salaries/${editingSalary._id}`, salaryData);
        setToast({ message: 'Salary updated successfully!', type: 'success' });
      } else {
        await api.post('/salaries', salaryData);
        setToast({ message: 'Salary created successfully!', type: 'success' });
      }
      
      setShowAddModal(false);
      setEditingSalary(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving salary:', error);
      setToast({ message: 'Failed to save salary', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSalaryForm({
      employee: '',
      basicSalary: '',
      housingAllowance: '',
      transportAllowance: '',
      mealAllowance: '',
      medicalAllowance: '',
      otherAllowance: '',
      taxDeduction: '15', // Default 15% tax
      insuranceDeduction: '5', // Default 5% insurance
      pensionDeduction: '',
      otherDeduction: '',
      currency: 'Rs.', // Default to Nepali Rupees
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  };

  const handleEdit = (salary) => {
    setEditingSalary(salary);
    
    // Calculate tax percentage from stored tax amount and gross salary
    const grossSalary = salary.basicSalary + salary.totalAllowances;
    const taxPercentage = grossSalary > 0 ? (salary.deductions.tax / grossSalary) * 100 : 0;
    
    // Calculate insurance percentage from stored insurance amount and basic salary
    const insurancePercentage = salary.basicSalary > 0 ? (salary.deductions.insurance / salary.basicSalary) * 100 : 0;
    
    setSalaryForm({
      employee: salary.employee._id,
      basicSalary: salary.basicSalary.toString(),
      housingAllowance: salary.allowances.housing.toString(),
      transportAllowance: salary.allowances.transport.toString(),
      mealAllowance: salary.allowances.meal.toString(),
      medicalAllowance: salary.allowances.medical.toString(),
      otherAllowance: salary.allowances.other.toString(),
      taxDeduction: taxPercentage.toFixed(1), // Show as percentage
      insuranceDeduction: insurancePercentage.toFixed(1), // Show as percentage
      pensionDeduction: salary.deductions.pension.toString(),
      otherDeduction: salary.deductions.other.toString(),
      currency: salary.currency || 'Rs.',
      effectiveDate: new Date(salary.effectiveDate).toISOString().split('T')[0],
      status: salary.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (salaryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this salary record?')) return;
    try {
      setLoading(true);
      await api.delete(`/salaries/${salaryId}`);
      setToast({ message: 'Salary deleted successfully!', type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ message: 'Failed to delete salary', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Custom currency formatter for Rs.
  const formatCurrency = (amount, currency = 'Rs.') => {
    if (currency === 'Rs.' || currency === 'NPR') {
      // Format with comma as thousand separator and Rs. prefix
      return `Rs. ${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    // Fallback to Intl for other currencies
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading && salaries.length === 0) {
    return (
      <div className="salaries-section">
        <div className="section-header">
          <h2>Salary Management</h2>
        </div>
        <div className="loading-spinner">Loading salary data...</div>
      </div>
    );
  }

  return (
    <div className="salaries-section">
      <div className="section-header">
        <h2>Salary Management</h2>
        <button 
          className="add-salary-btn"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i>
          Add Salary
        </button>
      </div>

      <div className="salaries-list">
        {salaries.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-money-bill-wave"></i>
            <p>No salary records found</p>
          </div>
        ) : (
          salaries.map(salary => {
            const isExpanded = expandedSalaryId === salary._id;
            return (
              <div key={salary._id} className={`salary-card${isExpanded ? ' expanded' : ''}`}
                style={{ cursor: 'pointer', marginBottom: '12px', boxShadow: isExpanded ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)' }}
                onClick={() => setExpandedSalaryId(isExpanded ? null : salary._id)}
              >
                {/* Summary Row */}
                <div className="salary-summary-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isExpanded ? '#f8f9fa' : '#fff', borderRadius: '8px', borderBottom: isExpanded ? '1px solid #e1e5e9' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#042F46', fontSize: '16px' }}>{salary.employee?.name}</span>
                    <span style={{ color: '#888', fontSize: '13px' }}>{salary.employee?.department} • {salary.employee?.position}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <span style={{ fontWeight: 700, color: '#1976d2', fontSize: '16px' }}>{formatCurrency(salary.netSalary, salary.currency)}</span>
                    <span className={`status-badge ${salary.status}`}>{salary.status}</span>
                    <span style={{ marginLeft: 8, color: '#888', fontSize: '18px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
                  </div>
                </div>
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="salary-details" style={{ padding: '20px 24px 10px 24px', background: '#f8f9fa', borderRadius: '0 0 8px 8px' }}>
                    <div className="detail-row">
                      <span>Basic Salary:</span>
                      <span>{formatCurrency(salary.basicSalary, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Total Allowances:</span>
                      <span>{formatCurrency(salary.totalAllowances, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Tax Deduction:</span>
                      <span>{salary.taxPercentage ? `${salary.taxPercentage}% (${formatCurrency(salary.deductions.tax, salary.currency)})` : formatCurrency(salary.deductions.tax, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Insurance Deduction:</span>
                      <span>{salary.insurancePercentage ? `${salary.insurancePercentage}% (${formatCurrency(salary.deductions.insurance, salary.currency)})` : formatCurrency(salary.deductions.insurance, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Other Deductions:</span>
                      <span>{formatCurrency(salary.deductions.pension + salary.deductions.other, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Net Salary:</span>
                      <span className="net-salary">{formatCurrency(salary.netSalary, salary.currency)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Effective Date:</span>
                      <span>{new Date(salary.effectiveDate).toLocaleDateString()}</span>
                    </div>
                    <div className="salary-actions" style={{ marginTop: 12 }}>
                      <button 
                        className="edit-btn"
                        onClick={e => { e.stopPropagation(); handleEdit(salary); }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        style={{ marginLeft: 8, background: '#e74c3c', color: 'white' }}
                        onClick={e => handleDelete(salary._id, e)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Salary Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSalary ? 'Edit Salary' : 'Add New Salary'}</h3>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                setEditingSalary(null);
                resetForm();
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee:</label>
                  <select
                    value={salaryForm.employee}
                    onChange={(e) => setSalaryForm({...salaryForm, employee: e.target.value})}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Basic Salary:</label>
                  <input
                    type="number"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({...salaryForm, basicSalary: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Housing Allowance:</label>
                    <input
                      type="number"
                      value={salaryForm.housingAllowance}
                      onChange={(e) => setSalaryForm({...salaryForm, housingAllowance: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Transport Allowance:</label>
                    <input
                      type="number"
                      value={salaryForm.transportAllowance}
                      onChange={(e) => setSalaryForm({...salaryForm, transportAllowance: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Deduction (%):</label>
                    <input
                      type="number"
                      value={salaryForm.taxDeduction}
                      onChange={(e) => setSalaryForm({...salaryForm, taxDeduction: e.target.value})}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 15"
                    />
                    <small className="form-help">Enter percentage (e.g., 15 for 15%)</small>
                  </div>
                  <div className="form-group">
                    <label>Insurance Deduction (%):</label>
                    <input
                      type="number"
                      value={salaryForm.insuranceDeduction}
                      onChange={(e) => setSalaryForm({...salaryForm, insuranceDeduction: e.target.value})}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 5"
                    />
                    <small className="form-help">Enter percentage (e.g., 5 for 5%)</small>
                  </div>
                </div>
                
                {/* Salary Calculation Preview */}
                <div className="salary-preview">
                  <h4>Salary Calculation Preview</h4>
                  <div className="calculation-details">
                    <div className="calc-row">
                      <span>Basic Salary:</span>
                      <span>{formatCurrency(parseFloat(salaryForm.basicSalary) || 0, salaryForm.currency)}</span>
                    </div>
                    <div className="calc-row">
                      <span>Total Allowances:</span>
                      <span>{formatCurrency(
                        (parseFloat(salaryForm.housingAllowance) || 0) +
                        (parseFloat(salaryForm.transportAllowance) || 0) +
                        (parseFloat(salaryForm.mealAllowance) || 0) +
                        (parseFloat(salaryForm.medicalAllowance) || 0) +
                        (parseFloat(salaryForm.otherAllowance) || 0), 
                        salaryForm.currency
                      )}</span>
                    </div>
                    <div className="calc-row">
                      <span>Gross Salary:</span>
                      <span className="gross-salary">{formatCurrency(
                        (parseFloat(salaryForm.basicSalary) || 0) +
                        (parseFloat(salaryForm.housingAllowance) || 0) +
                        (parseFloat(salaryForm.transportAllowance) || 0) +
                        (parseFloat(salaryForm.mealAllowance) || 0) +
                        (parseFloat(salaryForm.medicalAllowance) || 0) +
                        (parseFloat(salaryForm.otherAllowance) || 0), 
                        salaryForm.currency
                      )}</span>
                    </div>
                    <div className="calc-row">
                      <span>Tax Deduction ({(parseFloat(salaryForm.taxDeduction) || 0)}%):</span>
                      <span className="tax-amount">{formatCurrency(
                        ((parseFloat(salaryForm.basicSalary) || 0) +
                        (parseFloat(salaryForm.housingAllowance) || 0) +
                        (parseFloat(salaryForm.transportAllowance) || 0) +
                        (parseFloat(salaryForm.mealAllowance) || 0) +
                        (parseFloat(salaryForm.medicalAllowance) || 0) +
                        (parseFloat(salaryForm.otherAllowance) || 0)) * 
                        (parseFloat(salaryForm.taxDeduction) || 0) / 100, 
                        salaryForm.currency
                      )}</span>
                    </div>
                    <div className="calc-row">
                      <span>Insurance Deduction ({(parseFloat(salaryForm.insuranceDeduction) || 0)}%):</span>
                      <span className="insurance-amount">{formatCurrency(
                        (parseFloat(salaryForm.basicSalary) || 0) * 
                        (parseFloat(salaryForm.insuranceDeduction) || 0) / 100, 
                        salaryForm.currency
                      )}</span>
                    </div>
                    <div className="calc-row">
                      <span>Other Deductions:</span>
                      <span>{formatCurrency(
                        (parseFloat(salaryForm.pensionDeduction) || 0) +
                        (parseFloat(salaryForm.otherDeduction) || 0), 
                        salaryForm.currency
                      )}</span>
                    </div>
                    <div className="calc-row total">
                      <span>Net Salary:</span>
                      <span className="net-salary">{formatCurrency(
                        ((parseFloat(salaryForm.basicSalary) || 0) +
                        (parseFloat(salaryForm.housingAllowance) || 0) +
                        (parseFloat(salaryForm.transportAllowance) || 0) +
                        (parseFloat(salaryForm.mealAllowance) || 0) +
                        (parseFloat(salaryForm.medicalAllowance) || 0) +
                        (parseFloat(salaryForm.otherAllowance) || 0)) * 
                        (1 - (parseFloat(salaryForm.taxDeduction) || 0) / 100) -
                        ((parseFloat(salaryForm.basicSalary) || 0) * (parseFloat(salaryForm.insuranceDeduction) || 0) / 100) -
                        (parseFloat(salaryForm.pensionDeduction) || 0) -
                        (parseFloat(salaryForm.otherDeduction) || 0), 
                        salaryForm.currency
                      )}</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Currency:</label>
                  <select
                    value={salaryForm.currency}
                    onChange={(e) => setSalaryForm({...salaryForm, currency: e.target.value})}
                  >
                    <option value="Rs.">Nepali Rupees (Rs.)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="INR">Indian Rupees (₹)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Effective Date:</label>
                  <input
                    type="date"
                    value={salaryForm.effectiveDate}
                    onChange={(e) => setSalaryForm({...salaryForm, effectiveDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowAddModal(false);
                  setEditingSalary(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingSalary ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  );
};

export default SalaryManagement; 