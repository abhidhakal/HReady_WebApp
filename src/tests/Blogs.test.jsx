import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blogs from '../components/sections/Blogs.jsx';

describe('Blogs', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Blogs /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 