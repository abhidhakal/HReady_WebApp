import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeAnnouncements from '../pages/employee/EmployeeAnnouncements.jsx';

describe('EmployeeAnnouncements', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeAnnouncements /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 