import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsolePage } from './ConsolePage';
import { RealtimeClient } from '@openai/realtime-api-beta';

jest.mock('@openai/realtime-api-beta', () => ({
  RealtimeClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    updateSession: jest.fn(),
    addTool: jest.fn(),
    on: jest.fn(),
    sendUserMessageContent: jest.fn(),
    conversation: {
      getItems: jest.fn().mockReturnValue([]),
    },
  })),
}));

describe('ConsolePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ConsolePage />);
    expect(screen.getByText('realtime console')).toBeInTheDocument();
  });

  it('connects and disconnects correctly', async () => {
    render(<ConsolePage />);
    const connectButton = screen.getByText('connect');
    fireEvent.click(connectButton);
    await waitFor(() => expect(RealtimeClient.prototype.connect).toHaveBeenCalled());

    const disconnectButton = screen.getByText('disconnect');
    fireEvent.click(disconnectButton);
    await waitFor(() => expect(RealtimeClient.prototype.disconnect).toHaveBeenCalled());
  });

  it('toggles event log visibility', () => {
    render(<ConsolePage />);
    const hideEventsButton = screen.getByText('Hide Events');
    fireEvent.click(hideEventsButton);
    expect(screen.getByText('Show Events')).toBeInTheDocument();
  });

  it('toggles sidebar visibility', () => {
    render(<ConsolePage />);
    const hideSidebarButton = screen.getByText('Hide Sidebar');
    fireEvent.click(hideSidebarButton);
    expect(screen.getByText('Show Sidebar')).toBeInTheDocument();
  });

  it('handles push-to-talk button correctly', async () => {
    render(<ConsolePage />);
    const connectButton = screen.getByText('connect');
    fireEvent.click(connectButton);
    await waitFor(() => expect(RealtimeClient.prototype.connect).toHaveBeenCalled());

    const pushToTalkButton = screen.getByText('push to talk');
    fireEvent.mouseDown(pushToTalkButton);
    expect(pushToTalkButton).toHaveTextContent('release to send');
    fireEvent.mouseUp(pushToTalkButton);
    expect(pushToTalkButton).toHaveTextContent('push to talk');
  });
});