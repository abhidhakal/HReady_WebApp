import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeLeave from '../pages/employee/EmployeeLeave.jsx';

describe('EmployeeLeave', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <EmployeeLeave />
      </MemoryRouter>
    );
  });
}); 