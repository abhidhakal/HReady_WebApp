import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../components/sections/Contact.jsx';

describe('Contact', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 