import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GetStarted from '../pages/GetStarted.jsx';

describe('GetStarted', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><GetStarted /></MemoryRouter>);
    expect(true).toBe(true);
  });
}); 