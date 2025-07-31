import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '/src/components/Toast.jsx';

describe('Toast', () => {
  it('renders message and close button', () => {
    const handleClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={handleClose} />);
    expect(screen.getByText(/test message/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalled();
  });
}); 