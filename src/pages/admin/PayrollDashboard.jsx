import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import './styles/PayrollDashboard.css';
import api from '/src/api/api.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import PayrollPaymentModal from '/src/components/payroll/PayrollPaymentModal.jsx';
import SalaryManagement from '/src/components/payroll/SalaryManagement.jsx';
import AuthCheck from '/src/components/auth/AuthCheck.jsx';
import Modal from '/src/components/Modal.jsx';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';

const PayrollDashboard = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [payrollGenerating, setPayrollGenerating] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkPaying, setBulkPaying] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [stats, setStats] = useState({});
  const [payrolls, setPayrolls] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [name, setName] = useState('Admin');
  const [profilePicture, setProfilePicture] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [payrollMonthFilter, setPayrollMonthFilter] = useState(new Date().getMonth() + 1);
  const [payrollYearFilter, setPayrollYearFilter] = useState(new Date().getFullYear());
  const [showAllPayrolls, setShowAllPayrolls] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankModalEmployee, setBankModalEmployee] = useState(null);
  const [bankModalAccounts, setBankModalAccounts] = useState([]);
  const [bankModalLoading, setBankModalLoading] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollModalData, setPayrollModalData] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [salaryBudget, setSalaryBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [showPrePayrollModal, setShowPrePayrollModal] = useState(false);
  const [missingSalaryEmployees, setMissingSalaryEmployees] = useState([]);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [skippedEmployees, setSkippedEmployees] = useState([]);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    accountType: '',
    routingNumber: '',
    swiftCode: '',
    status: 'active'
  });
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [addBankForm, setAddBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    swiftCode: '',
    accountType: '',
  });
  
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout(navigate);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsAuthenticated(false);
          setAuthLoading(false);
          navigate('/login');
          return;
        }

        const res = await api.get('/admins/me');
        setName(res.data.name || 'Admin');
        setProfilePicture(res.data.profilePicture || '');
        setUserRole(res.data.role);
        
        // Check if user is admin
        if (res.data.role !== 'admin') {
          setIsAuthenticated(false);
          setToast({ message: 'Access denied. Admin privileges required.', type: 'error' });
          navigate('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setIsAuthenticated(false);
        if (error.response?.status === 403) {
          setToast({ message: 'Access denied. Please log in as admin.', type: 'error' });
          navigate('/login');
        } else {
          setName('Admin');
          setProfilePicture('');
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Check if user is authenticated
      const token = getToken();
      if (!token) {
        setToast({ message: 'Please log in to access payroll data', type: 'error' });
        navigate('/login');
        return;
      }

      console.log('Token found:', token ? 'Yes' : 'No');
      
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
      if (error.response?.status === 403) {
        setToast({ message: 'Access denied. Please log in as admin.', type: 'error' });
        navigate('/login');
      } else {
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  const checkMissingSalaryEmployees = () => {
    console.log('Employees:', employees);
    console.log('Salaries:', salaries);
    
    const missing = employees.filter(emp => {
      const hasSalary = salaries.some(sal => {
        // Check if salary is active and matches employee
        const salaryEmployeeId = sal.employee?._id || sal.employee;
        const isActive = sal.status === 'active';
        const matches = salaryEmployeeId === emp._id;
        
        console.log(`Checking employee ${emp.name} (${emp._id}) against salary employee ${salaryEmployeeId}, status: ${sal.status}, matches: ${matches}`);
        
        return matches && isActive;
      });
      
      if (!hasSalary) {
        console.log(`Employee ${emp.name} (${emp._id}) has no active salary`);
      }
      return !hasSalary;
    });
    
    console.log('Missing employees:', missing);
    setMissingSalaryEmployees(missing);
    return missing;
  };

  const handlePrePayroll = () => {
    const missing = checkMissingSalaryEmployees();
    if (missing.length > 0) {
      setShowPrePayrollModal(true);
    } else {
      generatePayroll();
    }
  };

  const generatePayroll = async () => {
    try {
      setPayrollGenerating(true);
      const res = await api.post('/payrolls/generate', {
        month: selectedMonth,
        year: selectedYear
      });
      setToast({ message: 'Payroll generated successfully!', type: 'success' });
      fetchDashboardData(); // Refresh data
      if (res.data.skippedEmployees && res.data.skippedEmployees.length > 0) {
        setSkippedEmployees(res.data.skippedEmployees);
        setShowSkippedModal(true);
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to generate payroll', 
        type: 'error' 
      });
    } finally {
      setPayrollGenerating(false);
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

  const markAsPaid = async (paymentData) => {
    try {
      await api.put(`/payrolls/${selectedPayroll._id}/mark-paid`, paymentData);
      setToast({ message: 'Payroll marked as paid!', type: 'success' });
      setShowPaymentModal(false);
      setSelectedPayroll(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      setToast({ message: 'Failed to mark payroll as paid', type: 'error' });
    }
  };

  const handleMarkAsPaid = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPaymentModal(true);
  };

  const openBankModal = async (employee) => {
    setBankModalEmployee(employee);
    setShowBankModal(true);
    setBankModalLoading(true);
    try {
      const res = await api.get(`/bank-accounts/employee/${employee._id}`);
      setBankModalAccounts(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      setBankModalAccounts([]);
    } finally {
      setBankModalLoading(false);
    }
  };

  const handleEditBank = (acc) => {
    setEditingBankAccount(acc);
    setBankForm({
      bankName: acc.bankName || '',
      accountNumber: acc.accountNumber || '',
      accountHolderName: acc.accountHolderName || '',
      accountType: acc.accountType || '',
      routingNumber: acc.routingNumber || '',
      swiftCode: acc.swiftCode || '',
      status: acc.status || 'active'
    });
    setShowEditBankModal(true);
  };
  const handleBankFormChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };
  const handleBankFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setBankModalLoading(true);
      await api.put(`/bank-accounts/${editingBankAccount._id}`, bankForm);
      setToast({ message: 'Bank info updated!', type: 'success' });
      setShowEditBankModal(false);
      setEditingBankAccount(null);
      openBankModal(bankModalEmployee); // Refresh
    } catch (error) {
      setToast({ message: 'Failed to update bank info', type: 'error' });
    } finally {
      setBankModalLoading(false);
    }
  };

  const handleAddBank = (employee) => {
    setAddBankForm({
      bankName: '',
      accountNumber: '',
      accountHolderName: employee.name || '',
      routingNumber: '',
      swiftCode: '',
      accountType: '',
    });
    setShowAddBankModal(true);
  };
  const handleAddBankFormChange = (e) => {
    setAddBankForm({ ...addBankForm, [e.target.name]: e.target.value });
  };
  const handleAddBankFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setBankModalLoading(true);
      await api.post('/bank-accounts', { ...addBankForm, employeeId: bankModalEmployee._id });
      setToast({ message: 'Bank info added!', type: 'success' });
      setShowAddBankModal(false);
      openBankModal(bankModalEmployee); // Refresh
    } catch (error) {
      setToast({ message: 'Failed to add bank info', type: 'error' });
    } finally {
      setBankModalLoading(false);
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

  // Payroll details modal
  const openPayrollModal = (payroll) => {
    setPayrollModalData(payroll);
    setShowPayrollModal(true);
  };

  // Bulk approve all draft payrolls
  const bulkApprovePayrolls = async () => {
    const drafts = payrolls.filter(p => {
      const statusMatch = p.status === 'draft';
      const periodMatch = showAllPayrolls || (p.month === payrollMonthFilter && p.year === payrollYearFilter);
      return statusMatch && periodMatch;
    });
    
    if (drafts.length === 0) {
      const periodText = showAllPayrolls ? 'all periods' : `for ${new Date(payrollYearFilter, payrollMonthFilter - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      setToast({ message: `No draft payrolls to approve ${periodText}.`, type: 'info' });
      return;
    }
    
    // Add confirmation dialog
    const periodText = showAllPayrolls ? 'all periods' : `for ${new Date(payrollYearFilter, payrollMonthFilter - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    const confirmed = window.confirm(
      `Are you sure you want to approve ${drafts.length} draft payroll(s) ${periodText}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setBulkApproving(true);
    try {
      await Promise.all(
        drafts.map(p => api.put(`/payrolls/${p._id}/approve`))
      );
      setToast({ message: 'All draft payrolls approved!', type: 'success' });
      fetchDashboardData();
    } catch (error) {
      setToast({ message: 'Failed to approve all payrolls', type: 'error' });
    } finally {
      setBulkApproving(false);
    }
  };

  // Bulk mark as paid all approved payrolls
  const bulkMarkAsPaid = async () => {
    const approved = payrolls.filter(p => {
      const statusMatch = p.status === 'approved';
      const periodMatch = showAllPayrolls || (p.month === payrollMonthFilter && p.year === payrollYearFilter);
      return statusMatch && periodMatch;
    });
    
    if (approved.length === 0) {
      const periodText = showAllPayrolls ? 'all periods' : `for ${new Date(payrollYearFilter, payrollMonthFilter - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      setToast({ message: `No approved payrolls to mark as paid ${periodText}.`, type: 'info' });
      return;
    }
    
    // Add confirmation dialog
    const periodText = showAllPayrolls ? 'all periods' : `for ${new Date(payrollYearFilter, payrollMonthFilter - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    const confirmed = window.confirm(
      `Are you sure you want to mark ${approved.length} approved payroll(s) as paid ${periodText}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setBulkPaying(true);
    try {
      await Promise.all(
        approved.map(p => api.put(`/payrolls/${p._id}/mark-paid`, {
          paymentMethod: 'bulk_payment',
          paymentDate: new Date().toISOString(),
          notes: 'Bulk payment processed'
        }))
      );
      setToast({ message: 'All approved payrolls marked as paid!', type: 'success' });
      fetchDashboardData();
    } catch (error) {
      setToast({ message: 'Failed to mark payrolls as paid', type: 'error' });
    } finally {
      setBulkPaying(false);
    }
  };

  // Fetch salary budget on mount
  useEffect(() => {
    fetchSalaryBudget();
  }, []);

  const fetchSalaryBudget = async () => {
    try {
      const res = await api.get('/payroll-settings/payroll-budget');
      setSalaryBudget(res.data?.budget || null);
    } catch {
      setSalaryBudget(null);
    }
  };

  const openSettingsModal = () => {
    setBudgetInput(salaryBudget ? salaryBudget.toString() : '');
    setShowSettingsModal(true);
  };

  const handleBudgetSave = async (e) => {
    e.preventDefault();
    setBudgetLoading(true);
    try {
      await api.put('/payroll-settings/payroll-budget', { budget: Number(budgetInput) });
      setToast({ message: 'Salary budget updated!', type: 'success' });
      setShowSettingsModal(false);
      fetchSalaryBudget();
    } catch {
      setToast({ message: 'Failed to update salary budget', type: 'error' });
    } finally {
      setBudgetLoading(false);
    }
  };

  if (authLoading || dashboardLoading) {
    return (
      <div className="full-screen">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <div className="loading-spinner">
            {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="full-screen">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Authentication Required</h3>
            <p>Please log in to access this page.</p>
            <p>Required role: admin</p>
            <p>Current role: {userRole || 'Not logged in'}</p>
            <button onClick={() => navigate('/login')}>
              Go to Login
            </button>
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
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} userRole="admin" />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
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
                  onClick={handlePrePayroll}
                  disabled={payrollGenerating}
                >
                  <i className="fas fa-plus"></i>
                  {payrollGenerating ? 'Generating...' : 'Generate Payroll'}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0 }}>Payroll Overview</h2>
                    <button className="settings-btn" onClick={openSettingsModal} title="Payroll Settings" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', marginLeft: 8 }}>
                      <i className="fas fa-cog"></i>
                    </button>
                  </div>
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
                        <h3>{salaryBudget !== null ? formatCurrency(salaryBudget, 'Rs.') : 'N/A'}</h3>
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
                    <h2>Payroll Records {!showAllPayrolls && `- ${new Date(payrollYearFilter, payrollMonthFilter - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}</h2>
                    <div className="filters">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={showAllPayrolls}
                            onChange={(e) => setShowAllPayrolls(e.target.checked)}
                            style={{ margin: 0 }}
                          />
                          <span style={{ fontSize: '14px' }}>Show All Months</span>
                        </label>
                        
                        {!showAllPayrolls && (
                          <>
                            <select 
                              value={payrollMonthFilter}
                              onChange={(e) => setPayrollMonthFilter(parseInt(e.target.value))}
                              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                            
                            <select 
                              value={payrollYearFilter}
                              onChange={(e) => setPayrollYearFilter(parseInt(e.target.value))}
                              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </>
                        )}
                        
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="approved">Pending Payments</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button className="btn-primary" onClick={bulkApprovePayrolls} disabled={bulkApproving}>
                          <i className="fas fa-check-double"></i> {bulkApproving ? 'Approving...' : 'Bulk Approve All'}
                        </button>
                        <button className="btn-primary" onClick={bulkMarkAsPaid} disabled={bulkPaying}>
                          <i className="fas fa-credit-card"></i> {bulkPaying ? 'Processing...' : 'Bulk Mark as Paid'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="payrolls-list">
                    {payrolls.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-file-invoice-dollar"></i>
                        <p>No payroll records found</p>
                      </div>
                    ) : (
                      payrolls
                        .filter(payroll => 
                          (showAllPayrolls || (payroll.month === payrollMonthFilter && payroll.year === payrollYearFilter)) &&
                          (!statusFilter || payroll.status === statusFilter)
                        )
                        .map(payroll => (
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
                                onClick={() => handleMarkAsPaid(payroll)}
                              >
                                <i className="fas fa-credit-card"></i>
                                Mark as Paid
                              </button>
                            )}
                            
                            <button 
                              className="view-btn"
                              onClick={() => openPayrollModal(payroll)}
                            >
                              <i className="fas fa-eye"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Payroll Details Modal */}
                  {showPayrollModal && payrollModalData && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h3>Payroll Details</h3>
                          <button className="modal-close" onClick={() => setShowPayrollModal(false)}>
                            <i className="fas fa-times"></i>
                    </button>
                  </div>
                        <div className="modal-body">
                          <div className="detail-row"><span>Employee:</span> <span>{payrollModalData.employee?.name}</span></div>
                          <div className="detail-row"><span>Period:</span> <span>{payrollModalData.month}/{payrollModalData.year}</span></div>
                          <div className="detail-row"><span>Status:</span> <span>{payrollModalData.status}</span></div>
                          <div className="detail-row"><span>Gross Salary:</span> <span>{formatCurrency(payrollModalData.grossSalary, payrollModalData.currency)}</span></div>
                          <div className="detail-row"><span>Net Salary:</span> <span>{formatCurrency(payrollModalData.netSalary, payrollModalData.currency)}</span></div>
                          <div className="detail-row"><span>Payment Date:</span> <span>{payrollModalData.paymentDate ? new Date(payrollModalData.paymentDate).toLocaleDateString() : 'N/A'}</span></div>
                          <div className="detail-row"><span>Payment Method:</span> <span>{payrollModalData.paymentMethod || 'N/A'}</span></div>
                          <div className="detail-row"><span>Transaction ID:</span> <span>{payrollModalData.transactionId || 'N/A'}</span></div>
                          <div className="detail-row"><span>Notes:</span> <span>{payrollModalData.notes || 'N/A'}</span></div>
                          <div style={{ marginTop: 16 }}>
                            <h4>Allowances</h4>
                            {payrollModalData.allowances && Object.entries(payrollModalData.allowances).map(([k, v]) => (
                              <div className="detail-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> <span>{formatCurrency(v, payrollModalData.currency)}</span></div>
                            ))}
                      </div>
                          <div style={{ marginTop: 16 }}>
                            <h4>Deductions</h4>
                            {payrollModalData.deductions && Object.entries(payrollModalData.deductions).map(([k, v]) => (
                              <div className="detail-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> <span>{formatCurrency(v, payrollModalData.currency)}</span></div>
                            ))}
                            </div>
                          <div style={{ marginTop: 16 }}>
                            <h4>Bonuses</h4>
                            {payrollModalData.bonuses && Object.entries(payrollModalData.bonuses).map(([k, v]) => (
                              <div className="detail-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> <span>{formatCurrency(v, payrollModalData.currency)}</span></div>
                            ))}
                          </div>
                          <div style={{ marginTop: 16 }}>
                            <h4>Overtime</h4>
                            {payrollModalData.overtime && Object.entries(payrollModalData.overtime).map(([k, v]) => (
                              <div className="detail-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> <span>{typeof v === 'number' ? formatCurrency(v, payrollModalData.currency) : v}</span></div>
                            ))}
                          </div>
                          <div style={{ marginTop: 16 }}>
                            <h4>Leaves</h4>
                            {payrollModalData.leaves && Object.entries(payrollModalData.leaves).map(([k, v]) => (
                              <div className="detail-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> <span>{v}</span></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
              )}

              {activeTab === 'salaries' && (
                <div>
                  {console.log('Rendering SalaryManagement component')}
                  <SalaryManagement />
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
                              {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
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
                              onClick={() => {
                                console.log('Switching to salaries tab');
                                setActiveTab('salaries');
                              }}
                            >
                              <i className="fas fa-money-bill-wave"></i>
                              Manage Salary
                            </button>
                            <button 
                              className="payroll-btn"
                              onClick={() => setActiveTab('payrolls')}
                            >
                              <i className="fas fa-file-invoice-dollar"></i>
                              View Payroll
                            </button>
                            <button 
                              className="bank-btn"
                              onClick={() => openBankModal(employee)}
                            >
                              <i className="fas fa-university"></i>
                              Banking Info
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bank Info Modal */}
                  {showBankModal && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h3>Banking Info for {bankModalEmployee?.name}</h3>
                          <button className="modal-close" onClick={() => setShowBankModal(false)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="modal-body">
                          {bankModalLoading ? (
                            <div className="loading-spinner">Loading...</div>
                          ) : bankModalAccounts.length === 0 ? (
                            <div className="empty-state">
                              <i className="fas fa-university"></i>
                              <p>No banking information available</p>
                              <button className="add-banking-btn" onClick={() => handleAddBank(bankModalEmployee)}>
                                <i className="fas fa-plus"></i>
                                Add Banking Information
                              </button>
                            </div>
                          ) : (
                            bankModalAccounts.map((acc, idx) => (
                              <div key={acc._id || idx} className="banking-card" style={{ marginBottom: 18 }}>
                                <div className="banking-header">
                                  <h4>{acc.bankName}</h4>
                                  <span className={`account-status ${acc.status}`}>{acc.status}</span>
                                </div>
                                <div className="banking-details">
                                  <div className="detail-row">
                                    <span>Account Number:</span>
                                    <span>{acc.accountNumber}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span>Account Holder:</span>
                                    <span>{acc.accountHolderName}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span>Account Type:</span>
                                    <span>{acc.accountType}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span>Routing Number:</span>
                                    <span>{acc.routingNumber}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span>SWIFT Code:</span>
                                    <span>{acc.swiftCode}</span>
                                  </div>
                                </div>
                                <div className="banking-actions" style={{ marginTop: 10 }}>
                                  <button className="update-btn" onClick={() => handleEditBank(acc)}>
                                    <i className="fas fa-edit"></i> Edit
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PayrollPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPayroll(null);
        }}
        onConfirm={markAsPaid}
        payroll={selectedPayroll}
        loading={false}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Payroll Settings</h3>
              <button className="modal-close" onClick={() => setShowSettingsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleBudgetSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Total Salary Budget (Rs.):</label>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSettingsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={budgetLoading}>
                  {budgetLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-payroll warning modal */}
      {showPrePayrollModal && (
        <Modal isOpen={showPrePayrollModal} onClose={() => setShowPrePayrollModal(false)}>
          <div>
            <h3>Some employees are missing salary information</h3>
            <ul>
              {missingSalaryEmployees.map(emp => (
                <li key={emp._id}>{emp.name} ({emp.email})</li>
              ))}
            </ul>
            <p>Payroll will not be generated for these employees. Please add salary info for them in Salary Management.</p>
            <button className="btn-primary" onClick={() => { setShowPrePayrollModal(false); setActiveTab('salaries'); }}>Go to Salary Management</button>
            <button className="btn-secondary" onClick={() => { setShowPrePayrollModal(false); generatePayroll(); }}>Proceed Anyway</button>
          </div>
        </Modal>
      )}
      {/* Skipped employees modal after payroll generation */}
      {showSkippedModal && (
        <Modal isOpen={showSkippedModal} onClose={() => setShowSkippedModal(false)}>
          <div>
            <h3>Some employees were skipped during payroll generation</h3>
            <ul>
              {skippedEmployees.map((emp, idx) => (
                <li key={idx}>{emp.name}: {emp.reason}</li>
              ))}
            </ul>
            <button className="btn-primary" onClick={() => setShowSkippedModal(false)}>OK</button>
          </div>
        </Modal>
      )}
      {/* Edit Bank Modal */}
      {showEditBankModal && (
        <Modal isOpen={showEditBankModal} onClose={() => setShowEditBankModal(false)}>
          <div>
            <h3>Edit Bank Info</h3>
            <form onSubmit={handleBankFormSubmit}>
              <div className="form-group">
                <label>Bank Name:</label>
                <input name="bankName" value={bankForm.bankName} onChange={handleBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Number:</label>
                <input name="accountNumber" value={bankForm.accountNumber} onChange={handleBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Holder Name:</label>
                <input name="accountHolderName" value={bankForm.accountHolderName} onChange={handleBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Type:</label>
                <input name="accountType" value={bankForm.accountType} onChange={handleBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Routing Number:</label>
                <input name="routingNumber" value={bankForm.routingNumber} onChange={handleBankFormChange} />
              </div>
              <div className="form-group">
                <label>SWIFT Code:</label>
                <input name="swiftCode" value={bankForm.swiftCode} onChange={handleBankFormChange} />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select name="status" value={bankForm.status} onChange={handleBankFormChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditBankModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={bankModalLoading}>{bankModalLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      {/* Add Bank Modal */}
      {showAddBankModal && (
        <Modal isOpen={showAddBankModal} onClose={() => setShowAddBankModal(false)}>
          <div>
            <h3>Add Bank Information for {bankModalEmployee?.name}</h3>
            <form onSubmit={handleAddBankFormSubmit}>
              <div className="form-group">
                <label>Bank Name:</label>
                <input name="bankName" value={addBankForm.bankName} onChange={handleAddBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Number:</label>
                <input name="accountNumber" value={addBankForm.accountNumber} onChange={handleAddBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Holder Name:</label>
                <input name="accountHolderName" value={addBankForm.accountHolderName} onChange={handleAddBankFormChange} required />
              </div>
              <div className="form-group">
                <label>Account Type:</label>
                <select name="accountType" value={addBankForm.accountType} onChange={handleAddBankFormChange} required>
                  <option value="">Select Account Type</option>
                  <option value="Saving">Saving</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Checking">Checking</option>
                </select>
              </div>
              <div className="form-group">
                <label>Routing Number:</label>
                <input name="routingNumber" value={addBankForm.routingNumber} onChange={handleAddBankFormChange} />
              </div>
              <div className="form-group">
                <label>SWIFT Code:</label>
                <input name="swiftCode" value={addBankForm.swiftCode} onChange={handleAddBankFormChange} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddBankModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={bankModalLoading}>{bankModalLoading ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PayrollDashboard; 