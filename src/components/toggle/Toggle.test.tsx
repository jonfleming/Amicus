import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders with default props', () => {
    render(<Toggle />);
    const toggle = screen.getByTestId('Switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with custom labels', () => {
    render(<Toggle labels={['On', 'Off']} />);
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('toggles value when clicked', () => {
    const onChange = jest.fn();
    render(<Toggle onChange={onChange} />);
    const toggle = screen.getByTestId('Switch');
    
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith(true, undefined);

    // Reset the mock before the second click
    onChange.mockClear();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledWith(false, undefined);
  });

  it('uses custom values when provided', () => {
    const onChange = jest.fn();
    render(<Toggle values={['yes', 'no']} onChange={onChange} />);
    const toggle = screen.getByTestId('Switch');
    
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true, 'no');

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false, 'yes');
  });

  it('respects defaultValue prop', () => {
    render(<Toggle defaultValue={true} />);
    const toggle = screen.getByTestId('Switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('respects string defaultValue prop', () => {
    render(<Toggle defaultValue="yes" values={['yes', 'no']} />);
    const toggle = screen.getByTestId('Switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});