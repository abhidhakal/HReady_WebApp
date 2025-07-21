import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeProfile from '../pages/employee/EmployeeProfile.jsx';

describe('EmployeeProfile', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeProfile /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 