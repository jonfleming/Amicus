import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the ConsolePage component
jest.mock('./pages/ConsolePage', () => ({
  ConsolePage: () => <div data-testid="mock-console-page">Mock Console Page</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    const appElement = screen.getByTestId('App');
    expect(appElement).toBeInTheDocument();
  });

  it('renders the ConsolePage component', () => {
    render(<App />);
    const consolePageElement = screen.getByTestId('mock-console-page');
    expect(consolePageElement).toBeInTheDocument();
  });
});
