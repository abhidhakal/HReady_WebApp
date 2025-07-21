import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';

Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_BASE_URL: '' } } },
  configurable: true
});

jest.mock('../api/axios', () => ({
  get: jest.fn((url) => {
    if (url === '/admins/me') return Promise.resolve({ data: { name: 'Admin', profilePicture: '' } });
    if (url === '/attendance/me') return Promise.resolve({ data: { check_in_time: '2024-06-01T09:00:00Z' } });
    if (url === '/announcements') return Promise.resolve({ data: [{ id: 1, title: 'Announcement A' }] });
    if (url === '/employees') return Promise.resolve({ data: [
      { id: 1, status: 'active' },
      { id: 2, status: 'on leave' },
      { id: 3, status: 'absent' }
    ] });
    if (url === '/leaves/all') return Promise.resolve({ data: [
      { id: 1, status: 'pending' },
      { id: 2, status: 'approved' }
    ] });
    if (url === '/tasks') return Promise.resolve({ data: [
      { id: 1, title: 'Admin Task 1', status: 'pending' },
      { id: 2, title: 'Admin Task 2', status: 'done' }
    ] });
    return Promise.resolve({ data: {} });
  })
}));

describe('AdminDashboard', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 