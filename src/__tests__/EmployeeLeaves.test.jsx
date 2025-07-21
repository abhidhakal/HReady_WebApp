import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeLeaves from '../pages/employee/EmployeeLeaves.jsx';

describe('EmployeeLeaves', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeLeaves /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 