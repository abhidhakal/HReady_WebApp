import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Services from '../components/sections/Services.jsx';

describe('Services', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Services /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 