import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';

describe('Login', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 