import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminAttendance from '../pages/admin/AdminAttendance.jsx';

describe('AdminAttendance', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><AdminAttendance /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 