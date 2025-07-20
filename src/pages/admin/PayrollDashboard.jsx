import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import './styles/PayrollDashboard.css';
import api from '../../api/axios';
import Toast from '../../components/common/Toast';
import LogoutConfirmModal from '../../components/common/LogoutConfirmModal';
import logo from '/src/assets/primary_icon.webp';
import { secureLogout } from '../../utils/authUtils';

const PayrollDashboard = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [stats, setStats] = useState({});
  const [payrolls, setPayrolls] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Admin');
  const [profilePicture, setProfilePicture] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const navigate = useNavigate();

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

    api.get('/admins/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setName(res.data.name || 'Admin');
        setProfilePicture(res.data.profilePicture || '');
      })
      .catch(() => {
        setName('Admin');
        setProfilePicture('');
      });
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, payrollsRes, salariesRes, employeesRes] = await Promise.all([
        api.get('/payrolls/stats'),
        api.get('/payrolls'),
        api.get('/salaries'),
        api.get('/employees')
      ]);

      setStats(statsRes.data);
      setPayrolls(payrollsRes.data);
      setSalaries(salariesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    try {
      setLoading(true);
      await api.post('/payrolls/generate', {
        month: selectedMonth,
        year: selectedYear
      });
      
      setToast({ message: 'Payroll generated successfully!', type: 'success' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error generating payroll:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to generate payroll', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePayroll = async (payrollId) => {
    try {
      await api.put(`/payrolls/${payrollId}/approve`);
      setToast({ message: 'Payroll approved successfully!', type: 'success' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving payroll:', error);
      setToast({ message: 'Failed to approve payroll', type: 'error' });
    }
  };

  const markAsPaid = async (payrollId) => {
    try {
      await api.put(`/payrolls/${payrollId}/mark-paid`, {
        paymentDate: new Date(),
        paymentMethod: 'bank_transfer'
      });
      setToast({ message: 'Payroll marked as paid!', type: 'success' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      setToast({ message: 'Failed to mark payroll as paid', type: 'error' });
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
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a className="active" onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/profile`)}>Profile</a></li>
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
              <h1>Payroll Management</h1>
              <div className="payroll-actions">
                <button 
                  className="generate-payroll-btn"
                  onClick={generatePayroll}
                  disabled={loading}
                >
                  <i className="fas fa-plus"></i>
                  Generate Payroll
                </button>
              </div>
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
                Payrolls
              </button>
              <button 
                className={`tab ${activeTab === 'salaries' ? 'active' : ''}`}
                onClick={() => setActiveTab('salaries')}
              >
                <i className="fas fa-money-bill-wave"></i>
                Salaries
              </button>
              <button 
                className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
              >
                <i className="fas fa-users"></i>
                Employees
              </button>
            </div>

            <div className="payroll-content">
              {activeTab === 'overview' && (
                <div className="overview-section">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{employees.length}</h3>
                        <p>Total Employees</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-money-bill-wave"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{formatCurrency(stats.overall?.totalSalaryBudget || 0)}</h3>
                        <p>Total Salary Budget</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-file-invoice-dollar"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{payrolls.filter(p => p.status === 'paid').length}</h3>
                        <p>Paid This Month</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{payrolls.filter(p => p.status === 'draft').length}</h3>
                        <p>Pending Approval</p>
                      </div>
                    </div>
                  </div>

                  <div className="payroll-generation-section">
                    <h2>Generate Monthly Payroll</h2>
                    <div className="generation-form">
                      <div className="form-group">
                        <label>Month:</label>
                        <select 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                          <option value={1}>January</option>
                          <option value={2}>February</option>
                          <option value={3}>March</option>
                          <option value={4}>April</option>
                          <option value={5}>May</option>
                          <option value={6}>June</option>
                          <option value={7}>July</option>
                          <option value={8}>August</option>
                          <option value={9}>September</option>
                          <option value={10}>October</option>
                          <option value={11}>November</option>
                          <option value={12}>December</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Year:</label>
                        <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payrolls' && (
                <div className="payrolls-section">
                  <div className="section-header">
                    <h2>Payroll Records</h2>
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
                            <div className="employee-info">
                              <h4>{payroll.employee?.name}</h4>
                              <p>{payroll.employee?.department} • {payroll.employee?.position}</p>
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
                              <span>Period:</span>
                              <span>{payroll.month}/{payroll.year}</span>
                            </div>
                            <div className="detail-row">
                              <span>Gross Salary:</span>
                              <span>{formatCurrency(payroll.grossSalary, payroll.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Net Salary:</span>
                              <span>{formatCurrency(payroll.netSalary, payroll.currency)}</span>
                            </div>
                          </div>
                          
                          <div className="payroll-actions">
                            {payroll.status === 'draft' && (
                              <button 
                                className="approve-btn"
                                onClick={() => approvePayroll(payroll._id)}
                              >
                                <i className="fas fa-check"></i>
                                Approve
                              </button>
                            )}
                            
                            {payroll.status === 'approved' && (
                              <button 
                                className="pay-btn"
                                onClick={() => markAsPaid(payroll._id)}
                              >
                                <i className="fas fa-credit-card"></i>
                                Mark as Paid
                              </button>
                            )}
                            
                            <button 
                              className="view-btn"
                              onClick={() => navigate(`/admin/payroll/${payroll._id}`)}
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

              {activeTab === 'salaries' && (
                <div className="salaries-section">
                  <div className="section-header">
                    <h2>Salary Management</h2>
                    <button 
                      className="add-salary-btn"
                      onClick={() => navigate('/admin/salary/new')}
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
                      salaries.map(salary => (
                        <div key={salary._id} className="salary-card">
                          <div className="salary-header">
                            <div className="employee-info">
                              <h4>{salary.employee?.name}</h4>
                              <p>{salary.employee?.department} • {salary.employee?.position}</p>
                            </div>
                            <div className="salary-status">
                              <span className={`status-badge ${salary.status}`}>
                                {salary.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="salary-details">
                            <div className="detail-row">
                              <span>Basic Salary:</span>
                              <span>{formatCurrency(salary.basicSalary, salary.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Total Allowances:</span>
                              <span>{formatCurrency(salary.totalAllowances, salary.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Net Salary:</span>
                              <span>{formatCurrency(salary.netSalary, salary.currency)}</span>
                            </div>
                            <div className="detail-row">
                              <span>Effective Date:</span>
                              <span>{new Date(salary.effectiveDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="salary-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => navigate(`/admin/salary/${salary._id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
                              Edit
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => navigate(`/admin/salary/${salary._id}`)}
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

              {activeTab === 'employees' && (
                <div className="employees-section">
                  <div className="section-header">
                    <h2>Employee Payroll Overview</h2>
                  </div>

                  <div className="employees-list">
                    {employees.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-users"></i>
                        <p>No employees found</p>
                      </div>
                    ) : (
                      employees.map(employee => (
                        <div key={employee._id} className="employee-card">
                          <div className="employee-header">
                            <div className="employee-avatar">
                              <img 
                                src={employee.profilePicture || '/src/assets/default-avatar.png'} 
                                alt={employee.name}
                              />
                            </div>
                            <div className="employee-info">
                              <h4>{employee.name}</h4>
                              <p>{employee.email}</p>
                              <p>{employee.department} • {employee.position}</p>
                            </div>
                            <div className="employee-status">
                              <span className={`status-badge ${employee.status}`}>
                                {employee.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="employee-actions">
                            <button 
                              className="salary-btn"
                              onClick={() => navigate(`/admin/employee/${employee._id}/salary`)}
                            >
                              <i className="fas fa-money-bill-wave"></i>
                              Manage Salary
                            </button>
                            <button 
                              className="payroll-btn"
                              onClick={() => navigate(`/admin/employee/${employee._id}/payroll`)}
                            >
                              <i className="fas fa-file-invoice-dollar"></i>
                              View Payroll
                            </button>
                            <button 
                              className="bank-btn"
                              onClick={() => navigate(`/admin/employee/${employee._id}/banking`)}
                            >
                              <i className="fas fa-university"></i>
                              Banking Info
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

export default PayrollDashboard; 