import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeAttendance from '../pages/employee/EmployeeAttendance.jsx';

describe('EmployeeAttendance', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeAttendance /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 