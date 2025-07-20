import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import './styles/EmployeePayroll.css';
import api from '../../api/axios';
import Toast from '../../components/common/Toast';
import LogoutConfirmModal from '../../components/common/LogoutConfirmModal';
import logo from '/src/assets/primary_icon.webp';
import { secureLogout } from '../../utils/authUtils';

const EmployeePayroll = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [payrolls, setPayrolls] = useState([]);
  const [salary, setSalary] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Employee');
  const [profilePicture, setProfilePicture] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const navigate = useNavigate();

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/src/assets/profile.svg';
    if (picture.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${picture}`;
    if (picture.startsWith('http')) return picture;
    return '/src/assets/profile.svg';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await secureLogout(
      navigate,
      () => setToast({ message: 'Logged out successfully', type: 'success' }),
      (error) => setToast({ message: 'Logout completed with warnings', type: 'warning' })
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/employees/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setName(res.data.name || 'Employee');
        setProfilePicture(res.data.profilePicture || '');
      })
      .catch(() => {
        setName('Employee');
        setProfilePicture('');
      });
  }, [navigate]);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [payrollsRes, salaryRes, bankRes] = await Promise.all([
        api.get('/payrolls/my-payrolls'),
        api.get('/salaries/my-salary'),
        api.get('/bank-accounts/my-account')
      ]);

      setPayrolls(payrollsRes.data);
      setSalary(salaryRes.data);
      setBankAccount(bankRes.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setToast({ message: 'Failed to load payroll data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payrolls/${payrollId}/payslip`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setToast({ message: 'Payslip downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setToast({ message: 'Failed to download payslip', type: 'error' });
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

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  if (loading) {
    return (
      <div className="full-screen">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leaves`)}>Leaves</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
            <li><a className="active" onClick={() => navigate(`/employee/${id}/payroll`)}>Payroll</a></li>
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
                        <h3>{bankAccount ? '✓' : '✗'}</h3>
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
                              onClick={() => downloadPayslip(payroll._id)}
                            >
                              <i className="fas fa-download"></i>
                              Download Payslip
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => navigate(`/employee/payroll/${payroll._id}`)}
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
                          Effective: {new Date(salary.effectiveDate).toLocaleDateString()}
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
                            <span>{formatCurrency(salary.housingAllowance, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Transport Allowance:</span>
                            <span>{formatCurrency(salary.transportAllowance, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Meal Allowance:</span>
                            <span>{formatCurrency(salary.mealAllowance, salary.currency)}</span>
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
                            <span>{formatCurrency(salary.tax, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Insurance:</span>
                            <span>{formatCurrency(salary.insurance, salary.currency)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Pension:</span>
                            <span>{formatCurrency(salary.pension, salary.currency)}</span>
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
                          <span>Account Holder:</span>
                          <span>{bankAccount.accountHolderName}</span>
                        </div>
                      </div>
                      
                      <div className="banking-actions">
                        <button className="update-btn">
                          <i className="fas fa-edit"></i>
                          Update Information
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-university"></i>
                      <p>No banking information available</p>
                      <button className="add-banking-btn">
                        <i className="fas fa-plus"></i>
                        Add Banking Information
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default EmployeePayroll; 