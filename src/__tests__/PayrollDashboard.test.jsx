import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PayrollDashboard from '../pages/admin/PayrollDashboard.jsx';

describe('PayrollDashboard', () => {
  it('shows authentication required message if not logged in', () => {
    render(<MemoryRouter><PayrollDashboard /></MemoryRouter>);
    expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
  });
}); 