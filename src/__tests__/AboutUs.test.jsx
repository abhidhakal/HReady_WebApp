import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutUs from '../components/sections/AboutUs.jsx';

describe('AboutUs', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><AboutUs /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 