import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeTasks from '../pages/employee/EmployeeTasks.jsx';

describe('EmployeeTasks', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeTasks /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 