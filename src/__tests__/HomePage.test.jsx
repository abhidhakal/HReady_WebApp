import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 