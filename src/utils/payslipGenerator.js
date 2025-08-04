import jsPDF from 'jspdf';

export const generatePayslipPDF = (payroll, employeeInfo) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('HREADY', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Human Resource Management System', 105, 30, { align: 'center' });
  doc.text('Payslip', 105, 40, { align: 'center' });
  
  // Payroll Period
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payroll Period: ${payroll.month}/${payroll.year}`, 20, 55);
  
  // Employee Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 20, 75);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${employeeInfo.name || 'N/A'}`, 20, 85);
  doc.text(`Email: ${employeeInfo.email || 'N/A'}`, 20, 95);
  doc.text(`Employee ID: ${employeeInfo._id || 'N/A'}`, 20, 105);
  
  // Payroll Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${payroll.status.toUpperCase()}`, 120, 85);
  if (payroll.paymentDate) {
    doc.text(`Payment Date: ${new Date(payroll.paymentDate).toLocaleDateString()}`, 120, 95);
  }
  
  // Salary Breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary Breakdown', 20, 125);
  
  let yPosition = 135;
  
  // Basic Salary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Basic Salary:', 20, yPosition);
  doc.text(`${payroll.currency || 'Rs.'} ${payroll.basicSalary?.toFixed(2) || '0.00'}`, 150, yPosition);
  yPosition += 10;
  
  // Allowances
  if (payroll.allowances) {
    if (payroll.allowances.housing > 0) {
      doc.text('Housing Allowance:', 20, yPosition);
      doc.text(`${payroll.currency || 'Rs.'} ${payroll.allowances.housing.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.allowances.transport > 0) {
      doc.text('Transport Allowance:', 20, yPosition);
      doc.text(`${payroll.currency || 'Rs.'} ${payroll.allowances.transport.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.allowances.meal > 0) {
      doc.text('Meal Allowance:', 20, yPosition);
      doc.text(`${payroll.currency || 'Rs.'} ${payroll.allowances.meal.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.allowances.medical > 0) {
      doc.text('Medical Allowance:', 20, yPosition);
      doc.text(`${payroll.currency || 'Rs.'} ${payroll.allowances.medical.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.allowances.other > 0) {
      doc.text('Other Allowance:', 20, yPosition);
      doc.text(`${payroll.currency || 'Rs.'} ${payroll.allowances.other.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
  }
  
  // Gross Salary
  doc.setFont('helvetica', 'bold');
  doc.text('Gross Salary:', 20, yPosition);
  doc.text(`${payroll.currency || 'Rs.'} ${payroll.grossSalary?.toFixed(2) || '0.00'}`, 150, yPosition);
  yPosition += 15;
  
  // Deductions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (payroll.deductions) {
    if (payroll.deductions.tax > 0) {
      doc.text('Tax Deduction:', 20, yPosition);
      doc.text(`-${payroll.currency || 'Rs.'} ${payroll.deductions.tax.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.deductions.insurance > 0) {
      doc.text('Insurance Deduction:', 20, yPosition);
      doc.text(`-${payroll.currency || 'Rs.'} ${payroll.deductions.insurance.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.deductions.pension > 0) {
      doc.text('Pension Deduction:', 20, yPosition);
      doc.text(`-${payroll.currency || 'Rs.'} ${payroll.deductions.pension.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
    
    if (payroll.deductions.other > 0) {
      doc.text('Other Deduction:', 20, yPosition);
      doc.text(`-${payroll.currency || 'Rs.'} ${payroll.deductions.other.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
  }
  
  // Total Deductions
  doc.setFont('helvetica', 'bold');
  doc.text('Total Deductions:', 20, yPosition);
  doc.text(`-${payroll.currency || 'Rs.'} ${payroll.totalDeductions?.toFixed(2) || '0.00'}`, 150, yPosition);
  yPosition += 15;
  
  // Net Salary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Salary:', 20, yPosition);
  doc.text(`${payroll.currency || 'Rs.'} ${payroll.netSalary?.toFixed(2) || '0.00'}`, 150, yPosition);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer generated document. No signature required.', 105, 270, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 275, { align: 'center' });
  
  return doc;
};

export const downloadPayslipPDF = (payroll, employeeInfo) => {
  try {
    const doc = generatePayslipPDF(payroll, employeeInfo);
    const fileName = `payslip-${payroll.month}-${payroll.year}-${employeeInfo.name || 'employee'}.pdf`;
    doc.save(fileName);
    return { success: true };
  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    return { success: false, error };
  }
}; 