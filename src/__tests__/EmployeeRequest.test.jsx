import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeRequest from '../pages/employee/EmployeeRequest.jsx';

describe('EmployeeRequest', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeRequest /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 