import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProfile from '../pages/admin/AdminProfile.jsx';

describe('AdminProfile', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><AdminProfile /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 