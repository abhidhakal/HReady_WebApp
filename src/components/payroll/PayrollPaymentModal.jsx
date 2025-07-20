import React, { useState } from 'react';
import '/src/pages/admin/styles/PayrollDashboard.css';

const PayrollPaymentModal = ({ isOpen, onClose, onConfirm, payroll, loading }) => {
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    transactionId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Mark Payroll as Paid</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="payment-info">
              <p><strong>Employee:</strong> {payroll?.employee?.name}</p>
              <p><strong>Period:</strong> {payroll?.month}/{payroll?.year}</p>
              <p><strong>Amount:</strong> ${payroll?.netSalary?.toFixed(2)}</p>
            </div>
            
            <div className="form-group">
              <label>Payment Date:</label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Payment Method:</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Transaction ID (Optional):</label>
              <input
                type="text"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                placeholder="Enter transaction ID"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Mark as Paid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollPaymentModal; 