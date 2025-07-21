import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeePayroll from '../pages/employee/EmployeePayroll.jsx';

describe('EmployeePayroll', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeePayroll /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 