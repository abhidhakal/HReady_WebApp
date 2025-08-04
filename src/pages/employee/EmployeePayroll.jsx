import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import '../../pages/admin/styles/PayrollDashboard.css';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import api from '/src/api/api.js';
// Import services
import { getMyPayrollHistory, getMySalary, getMyBankAccount, updateMyBankAccount, createMyBankAccount } from '/src/services/index.js';
import { downloadPayslipPDF } from '/src/utils/payslipGenerator.js';
import './styles/EmployeePayroll.css';

// Custom currency formatter for Rs.
const formatCurrency = (amount, currency = 'Rs.') => {
  if (currency === 'Rs.' || currency === 'NPR') {
    // Format with comma as thousand separator and Rs. prefix
    return `Rs. ${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  // Fallback to Intl for other currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch {
    return amount;
  }
};

const EmployeePayroll = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState([]);
  const [salary, setSalary] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [name, setName] = useState('Employee');
  const [profilePicture, setProfilePicture] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPayrollDetailsModal, setShowPayrollDetailsModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    swiftCode: '',
    accountType: '',
  });
  const [isAddBank, setIsAddBank] = useState(false); // distinguish add vs update
  
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout(
      navigate,
      () => showSuccess('Logged out successfully'),
      (error) => showError('Logout completed with warnings')
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // This will be handled by the profile service later
    // For now, keeping the direct API call for user info
    api.get('/employees/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setName(res.data.name || 'Employee');
        setProfilePicture(res.data.profilePicture || '');
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
        setName('Employee');
        setProfilePicture('');
        showError('Failed to load user information');
      });
  }, [navigate, getToken]);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      // Use services instead of direct API calls
      const [payrollsResult, salaryResult, bankResult] = await Promise.all([
        getMyPayrollHistory(),
        getMySalary(),
        getMyBankAccount()
      ]);

      if (payrollsResult.success) {
        setPayrolls(payrollsResult.data);
      } else {
        showError('Failed to load payroll history');
        console.error('Error fetching payrolls:', payrollsResult.error);
      }

      if (salaryResult.success) {
        setSalary(salaryResult.data);
      } else {
        showError('Failed to load salary information');
        console.error('Error fetching salary:', salaryResult.error);
      }

      if (bankResult.success) {
      // Fix: set bankAccount to the default or first account if array
      setBankAccount(
          Array.isArray(bankResult.data)
            ? bankResult.data.find(acc => acc.isDefault) || bankResult.data[0] || null
            : bankResult.data
        );
      } else {
        showError('Failed to load bank account information');
        console.error('Error fetching bank account:', bankResult.error);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      showError('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payrollId) => {
    try {
      // Find the payroll data from the current payrolls list
      const payroll = payrolls.find(p => p._id === payrollId);
      if (!payroll) {
        showError('Payroll data not found');
        return;
      }

      // Get employee info
      const employeeInfo = {
        name: name,
        email: '', // You might want to get this from user data
        _id: id
      };

      const result = downloadPayslipPDF(payroll, employeeInfo);
      if (result.success) {
        showSuccess('Payslip downloaded successfully!');
      } else {
        showError('Failed to generate payslip');
        console.error('Error generating payslip:', result.error);
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      showError('Failed to download payslip');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#f39c12';
      case 'approved': return '#3498db';
      case 'paid': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // When opening modal, prefill form
  const openBankModal = (isAdd = false) => {
    setIsAddBank(isAdd);
    if (!isAdd && bankAccount) {
      setBankForm({
        _id: bankAccount._id, // Include the _id for updating
        bankName: bankAccount.bankName || '',
        accountNumber: bankAccount.accountNumber || '',
        accountHolderName: bankAccount.accountHolderName || '',
        routingNumber: bankAccount.routingNumber || '',
        swiftCode: bankAccount.swiftCode || '',
        accountType: bankAccount.accountType || '',
      });
    } else {
      setBankForm({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        routingNumber: '',
        swiftCode: '',
        accountType: '',
      });
    }
    setShowBankModal(true);
  };

  const handleBankFormChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleBankFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isAddBank) {
        const result = await createMyBankAccount(bankForm);
        if (result.success) {
          showSuccess('Bank information added!');
        } else {
          showError('Failed to add bank information');
          console.error('Error creating bank account:', result.error);
        }
      } else {
        const result = await updateMyBankAccount(bankForm);
        if (result.success) {
          showSuccess('Bank information updated!');
        } else {
          showError('Failed to update bank information');
          console.error('Error updating bank account:', result.error);
        }
      }
      setShowBankModal(false);
      fetchPayrollData();
    } catch (error) {
      showError('Failed to save bank info');
      console.error('Error saving bank info:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPayrollDetailsModal = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayrollDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="full-screen">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <div className="main-content">
            <div className="payroll-dashboard">
              <div className="payroll-header">
                <Skeleton variant="text" width={200} height={40} style={{ marginBottom: 24 }} />
              </div>
              
              <div className="payroll-tabs">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} variant="rectangular" width={120} height={40} style={{ marginRight: 12, borderRadius: 6 }} />
                ))}
              </div>

              <div className="payroll-content">
                <div className="stats-grid">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ padding: 20, border: '1px solid #e1e5e9', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <Skeleton variant="text" width={60} height={24} style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <Skeleton variant="circular" width={48} height={48} style={{ marginRight: 16 }} />
                        <Skeleton variant="text" width={80} height={32} />
                      </div>
                      <Skeleton variant="text" width={40} height={16} style={{ marginTop: 12 }} />
              </div>
            ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
          <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/profile`)}>Profile</a></li>
            <li>
              <a
                className="nav-logout"
                onClick={handleLogoutClick}
              >
                Log Out
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="payroll-dashboard">
            <div className="payroll-header">
              <h1>My Payroll</h1>
            </div>

            <div className="payroll-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-line"></i>
                Overview
              </button>
              <button 
                className={`tab ${activeTab === 'payrolls' ? 'active' : ''}`}
                onClick={() => setActiveTab('payrolls')}
              >
                <i className="fas fa-file-invoice-dollar"></i>
                Payroll History
              </button>
              <button 
                className={`tab ${activeTab === 'salary' ? 'active' : ''}`}
                onClick={() => setActiveTab('salary')}
              >
                <i className="fas fa-money-bill-wave"></i>
                Salary Details
              </button>
              <button 
                className={`tab ${activeTab === 'banking' ? 'active' : ''}`}
                onClick={() => setActiveTab('banking')}
              >
                <i className="fas fa-university"></i>
                Banking Info
              </button>
            </div>

            <div className="payroll-content">
              {activeTab === 'overview' && (
                <div className="overview-section">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-money-bill-wave"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{salary ? formatCurrency(salary.netSalary, salary.currency) : 'N/A'}</h3>
                        <p>Current Net Salary</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-file-invoice-dollar"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{payrolls.filter(p => p.status === 'paid').length}</h3>
                        <p>Paid This Year</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{payrolls.filter(p => p.status === 'approved').length}</h3>
                        <p>Pending Payment</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-university"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{bankAccount ? 'Yes' : 'No'}</h3>
                        <p>Bank Account</p>
                      </div>
                    </div>
                  </div>

                  <div className="recent-payrolls">
                    <h2>Recent Payrolls</h2>
                    <div className="recent-list">
                      {payrolls.slice(0, 3).map(payroll => (
                        <div key={payroll._id} className="recent-payroll-card">
                          <div className="payroll-info">
                            <h4>{payroll.month}/{payroll.year}</h4>
                            <p>{formatCurrency(payroll.netSalary, payroll.currency)}</p>
                          </div>
                          <div className="payroll-status">
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(payroll.status) }}
                            >
                              {payroll.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payrolls' && (
                <div className="payrolls-section">
                  <div className="section-header">
                    <h2>Payroll History</h2>
                    <div className="filters">
                      <select onChange={(e) => {
                        // Filter by status
                      }}>
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="payrolls-list">
                    {payrolls.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-file-invoice-dollar"></i>
                        <p>No payroll records found</p>
                      </div>
                    ) : (
                      payrolls.map(payroll => (
                        <div key={payroll._id} className="payroll-card">
                          <div className="payroll-header">
                            <div className="payroll-period">
                              <h4>{payroll.month}/{payroll.year}</h4>
                              <p>Payroll Period</p>
                            </div>
                            <div className="payroll-status">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(payroll.status) }}
                              >
                                {payroll.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="payroll-details">
                            <div className="detail-row">
                              <span>Gross Salary:</span>
                              <span>{formatCurrency(payroll.grossSalary, payroll.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Deductions:</span>
                              <span>{formatCurrency(payroll.totalDeductions, payroll.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Net Salary:</span>
                              <span className="net-salary">{formatCurrency(payroll.netSalary, payroll.currency)}</span>
                            </div>
                            {payroll.paymentDate && (
                              <div className="detail-row">
                                <span>Payment Date:</span>
                                <span>{new Date(payroll.paymentDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="payroll-actions">
                            <button 
                              className="download-btn"
                              onClick={() => handleDownloadPayslip(payroll._id)}
                            >
                              <i className="fas fa-download"></i>
                              Download Payslip
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => openPayrollDetailsModal(payroll)}
                            >
                              <i className="fas fa-eye"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'salary' && (
                <div className="salary-section">
                  <div className="section-header">
                    <h2>Salary Details</h2>
                  </div>

                  {salary ? (
                    <div className="salary-details-card">
                      <div className="salary-header">
                        <h3>Current Salary Structure</h3>
                        <span className="effective-date">
                          Effective: {salary.effectiveDate ? new Date(salary.effectiveDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="salary-breakdown">
                        <div className="breakdown-section">
                          <h4>Basic Components</h4>
                          <div className="breakdown-item">
                            <span>Basic Salary:</span>
                            <span>{formatCurrency(salary.basicSalary, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Housing Allowance:</span>
                            <span>{formatCurrency(salary.allowances?.housing || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Transport Allowance:</span>
                            <span>{formatCurrency(salary.allowances?.transport || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Meal Allowance:</span>
                            <span>{formatCurrency(salary.allowances?.meal || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Medical Allowance:</span>
                            <span>{formatCurrency(salary.allowances?.medical || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Other Allowance:</span>
                            <span>{formatCurrency(salary.allowances?.other || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item total">
                            <span>Total Allowances:</span>
                            <span>{formatCurrency(salary.totalAllowances, salary.currency)}</span>
                          </div>
                        </div>
                        
                        <div className="breakdown-section">
                          <h4>Deductions</h4>
                          <div className="breakdown-item">
                            <span>Tax:</span>
                            <span>{formatCurrency(salary.deductions?.tax || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Insurance:</span>
                            <span>{formatCurrency(salary.deductions?.insurance || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Pension:</span>
                            <span>{formatCurrency(salary.deductions?.pension || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Other Deduction:</span>
                            <span>{formatCurrency(salary.deductions?.other || 0, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item total">
                            <span>Total Deductions:</span>
                            <span>{formatCurrency(salary.totalDeductions, salary.currency)}</span>
                          </div>
                        </div>
                        
                        <div className="breakdown-section net">
                          <h4>Net Salary</h4>
                          <div className="breakdown-item net-salary">
                            <span>Net Amount:</span>
                            <span>{formatCurrency(salary.netSalary, salary.currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-money-bill-wave"></i>
                      <p>No salary information available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'banking' && (
                <div className="banking-section">
                  <div className="section-header">
                    <h2>Banking Information</h2>
                  </div>

                  {bankAccount ? (
                    <div className="banking-card">
                      <div className="banking-header">
                        <h3>Payment Account</h3>
                        <span className="account-status active">Active</span>
                      </div>
                      <div className="banking-details">
                        <div className="detail-row">
                          <span>Bank Name:</span>
                          <span>{bankAccount.bankName}</span>
                        </div>
                        <div className="detail-row">
                          <span>Account Number:</span>
                          <span>{bankAccount.accountNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span>Account Type:</span>
                          <span>{bankAccount.accountType}</span>
                        </div>
                        <div className="detail-row">
                          <span>Routing Number:</span>
                          <span>{bankAccount.routingNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span>SWIFT Code:</span>
                          <span>{bankAccount.swiftCode}</span>
                        </div>
                        <div className="detail-row">
                          <span>Account Holder:</span>
                          <span>{bankAccount.accountHolderName}</span>
                        </div>
                      </div>
                      <div className="banking-actions">
                        <button className="update-btn" onClick={() => openBankModal(false)}>
                          <i className="fas fa-edit"></i>
                          Update Information
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-university"></i>
                      <p>No banking information available</p>
                      <button className="add-banking-btn" onClick={() => openBankModal(true)}>
                        <i className="fas fa-plus"></i>
                        Add Banking Information
                      </button>
                    </div>
                  )}

                  {/* Bank Info Modal (Add or Update) */}
                  {showBankModal && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h3>{isAddBank ? 'Add Bank Information' : 'Update Bank Information'}</h3>
                          <button className="modal-close" onClick={() => setShowBankModal(false)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <form onSubmit={handleBankFormSubmit}>
                          <div className="modal-body">
                            <div className="form-group">
                              <label>Bank Name:</label>
                              <input
                                type="text"
                                name="bankName"
                                value={bankForm.bankName}
                                onChange={handleBankFormChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Account Number:</label>
                              <input
                                type="text"
                                name="accountNumber"
                                value={bankForm.accountNumber}
                                onChange={handleBankFormChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Account Holder Name:</label>
                              <input
                                type="text"
                                name="accountHolderName"
                                value={bankForm.accountHolderName}
                                onChange={handleBankFormChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Routing Number:</label>
                              <input
                                type="text"
                                name="routingNumber"
                                value={bankForm.routingNumber}
                                onChange={handleBankFormChange}
                              />
                            </div>
                            <div className="form-group">
                              <label>SWIFT Code:</label>
                              <input
                                type="text"
                                name="swiftCode"
                                value={bankForm.swiftCode}
                                onChange={handleBankFormChange}
                              />
                            </div>
                            <div className="form-group">
                              <label>Account Type:</label>
                              <select
                                name="accountType"
                                value={bankForm.accountType || 'Saving'}
                                onChange={handleBankFormChange}
                                required
                              >
                                <option value="Saving">Saving</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                                <option value="Checking">Checking</option>
                              </select>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setShowBankModal(false)}>
                              Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                              {loading ? 'Saving...' : (isAddBank ? 'Add' : 'Save')}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Details Modal */}
      {showPayrollDetailsModal && selectedPayroll && (
        <div className="modal-overlay">
          <div className="modal-content payroll-details-modal">
            <div className="modal-header">
              <h3>Payroll Details - {selectedPayroll.month}/{selectedPayroll.year}</h3>
              <button className="modal-close" onClick={() => setShowPayrollDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payroll-details-section">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Payroll Period:</span>
                      <span className="value">{selectedPayroll.month}/{selectedPayroll.year}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span 
                        className="value status-badge"
                        style={{ backgroundColor: getStatusColor(selectedPayroll.status) }}
                      >
                        {selectedPayroll.status}
                      </span>
                    </div>
                    {selectedPayroll.paymentDate && (
                      <div className="detail-item">
                        <span className="label">Payment Date:</span>
                        <span className="value">{new Date(selectedPayroll.paymentDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Salary Breakdown</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Basic Salary:</span>
                      <span className="value">{formatCurrency(selectedPayroll.basicSalary, selectedPayroll.currency)}</span>
                    </div>
                    {selectedPayroll.allowances && (
                      <>
                        {selectedPayroll.allowances.housing > 0 && (
                          <div className="detail-item">
                            <span className="label">Housing Allowance:</span>
                            <span className="value">{formatCurrency(selectedPayroll.allowances.housing, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.allowances.transport > 0 && (
                          <div className="detail-item">
                            <span className="label">Transport Allowance:</span>
                            <span className="value">{formatCurrency(selectedPayroll.allowances.transport, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.allowances.meal > 0 && (
                          <div className="detail-item">
                            <span className="label">Meal Allowance:</span>
                            <span className="value">{formatCurrency(selectedPayroll.allowances.meal, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.allowances.medical > 0 && (
                          <div className="detail-item">
                            <span className="label">Medical Allowance:</span>
                            <span className="value">{formatCurrency(selectedPayroll.allowances.medical, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.allowances.other > 0 && (
                          <div className="detail-item">
                            <span className="label">Other Allowance:</span>
                            <span className="value">{formatCurrency(selectedPayroll.allowances.other, selectedPayroll.currency)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="detail-item total">
                      <span className="label">Gross Salary:</span>
                      <span className="value">{formatCurrency(selectedPayroll.grossSalary, selectedPayroll.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Deductions</h4>
                  <div className="detail-grid">
                    {selectedPayroll.deductions && (
                      <>
                        {selectedPayroll.deductions.tax > 0 && (
                          <div className="detail-item">
                            <span className="label">Tax Deduction:</span>
                            <span className="value deduction">{formatCurrency(selectedPayroll.deductions.tax, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.deductions.insurance > 0 && (
                          <div className="detail-item">
                            <span className="label">Insurance Deduction:</span>
                            <span className="value deduction">{formatCurrency(selectedPayroll.deductions.insurance, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.deductions.pension > 0 && (
                          <div className="detail-item">
                            <span className="label">Pension Deduction:</span>
                            <span className="value deduction">{formatCurrency(selectedPayroll.deductions.pension, selectedPayroll.currency)}</span>
                          </div>
                        )}
                        {selectedPayroll.deductions.other > 0 && (
                          <div className="detail-item">
                            <span className="label">Other Deduction:</span>
                            <span className="value deduction">{formatCurrency(selectedPayroll.deductions.other, selectedPayroll.currency)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="detail-item total">
                      <span className="label">Total Deductions:</span>
                      <span className="value deduction">{formatCurrency(selectedPayroll.totalDeductions, selectedPayroll.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section final">
                  <h4>Final Amount</h4>
                  <div className="detail-grid">
                    <div className="detail-item net-salary">
                      <span className="label">Net Salary:</span>
                      <span className="value">{formatCurrency(selectedPayroll.netSalary, selectedPayroll.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowPayrollDetailsModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleDownloadPayslip(selectedPayroll._id)}
              >
                <i className="fas fa-download"></i>
                Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default EmployeePayroll; 