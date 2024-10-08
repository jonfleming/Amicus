import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { Mail } from 'react-feather';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Okay');
    expect(button).toHaveClass('button-style-regular');
  });

  it('renders with custom label', () => {
    render(<Button label="Custom Label" />);
    expect(screen.getByRole('button')).toHaveTextContent('Custom Label');
  });

  it('renders with icon at start position', () => {
    render(<Button icon={Mail} />);
    const iconStart = screen.getByRole('button').querySelector('.icon-start');
    expect(iconStart).toBeInTheDocument();
  });

  it('renders with icon at end position', () => {
    render(<Button icon={Mail} iconPosition="end" />);
    const iconEnd = screen.getByRole('button').querySelector('.icon-end');
    expect(iconEnd).toBeInTheDocument();
  });

  it('applies correct icon color class', () => {
    render(<Button icon={Mail} iconColor="red" />);
    expect(screen.getByRole('button')).toHaveClass('icon-red');
  });

  it('applies icon fill class when specified', () => {
    render(<Button icon={Mail} iconFill />);
    expect(screen.getByRole('button')).toHaveClass('icon-fill');
  });

  it('applies correct button style class', () => {
    render(<Button buttonStyle="action" />);
    expect(screen.getByRole('button')).toHaveClass('button-style-action');
  });
});