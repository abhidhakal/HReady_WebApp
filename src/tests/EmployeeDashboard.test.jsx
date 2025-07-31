import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard.jsx';

// Mock the API module
jest.mock('../api/api', () => ({
  get: jest.fn((url) => {
    if (url === '/employees/me') return Promise.resolve({ data: { name: 'Alice', position: 'Developer', profilePicture: '' } });
    if (url === '/attendance/me') return Promise.resolve({ data: { check_in_time: '2024-06-01T09:00:00Z' } });
    return Promise.resolve({ data: {} });
  })
}));

describe('EmployeeDashboard', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );
  });
}); 