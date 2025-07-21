import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard.jsx';

Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_BASE_URL: '' } } },
  configurable: true
});

jest.mock('../api/axios', () => ({
  get: jest.fn((url) => {
    if (url === '/employees/me') return Promise.resolve({ data: { name: 'Alice', position: 'Developer', profilePicture: '' } });
    if (url === '/attendance/me') return Promise.resolve({ data: { check_in_time: '2024-06-01T09:00:00Z' } });
    if (url === '/announcements') return Promise.resolve({ data: [{ id: 1, title: 'Announcement 1' }] });
    if (url === '/tasks/my') return Promise.resolve({ data: [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'done' }
    ] });
    return Promise.resolve({ data: {} });
  })
}));

describe('EmployeeDashboard', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><EmployeeDashboard /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 