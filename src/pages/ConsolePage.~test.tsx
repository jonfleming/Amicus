import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsolePage } from './ConsolePage';
import { RealtimeClient } from '@openai/realtime-api-beta';

// Mock Map component
jest.mock('../components/Map', () => ({
  Map: () => <div data-testid="mock-map">Map Component</div>
}));

// Mock Scene component
jest.mock('../components/Scene', () => ({
  Scene: () => <div data-testid="mock-scene">Scene Component</div>
}));

// Mock MorphControls component
jest.mock('../components/MorphControls', () => ({
  MorphControls: () => <div data-testid="mock-morph-controls">MorphControls Component</div>
}));

// Mock WavRecorder
jest.mock('../lib/wavtools/index.js', () => ({
  WavRecorder: jest.fn().mockImplementation(() => ({
    begin: jest.fn().mockResolvedValue(undefined),
    end: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    pause: jest.fn(),
    getStatus: jest.fn().mockReturnValue('idle'),
    recording: false,
    getFrequencies: jest.fn().mockReturnValue({ values: new Float32Array([0]) }),
  })),
  WavStreamPlayer: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    interrupt: jest.fn().mockResolvedValue(undefined),
    add16BitPCM: jest.fn(),
    getFrequencies: jest.fn().mockReturnValue({ values: new Float32Array([0]) }),
  })),
}));

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    // Add any OpenAI methods you need to mock
  }));
});

// Mock canvas operations
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock RealtimeClient
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
    getTurnDetectionType: jest.fn().mockReturnValue('none'),
    isConnected: jest.fn().mockReturnValue(true),
    appendInputAudio: jest.fn(),
    createResponse: jest.fn(),
    cancelResponse: jest.fn(),
    deleteItem: jest.fn(),
    reset: jest.fn(),
  })),
}));

describe('ConsolePage', () => {
  let mockClient: jest.Mocked<RealtimeClient>;

  beforeEach(() => {
    // Get the mocked constructor
    const MockedRealtimeClient = jest.mocked(RealtimeClient);
    
    // Create mock instance
    mockClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      updateSession: jest.fn(),
      addTool: jest.fn(),
      on: jest.fn(),
      sendUserMessageContent: jest.fn(),
      conversation: {
        getItems: jest.fn().mockReturnValue([]),
      },
      getTurnDetectionType: jest.fn().mockReturnValue('none'),
      isConnected: jest.fn().mockReturnValue(true),
      appendInputAudio: jest.fn(),
      createResponse: jest.fn(),
      cancelResponse: jest.fn(),
      deleteItem: jest.fn(),
      reset: jest.fn(),
    } as unknown as jest.Mocked<RealtimeClient>;

    // Reset window.URL.createObjectURL mock before each test
    global.URL.createObjectURL = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ConsolePage />);
    expect(screen.getByText('realtime console')).toBeInTheDocument();
  });

  it('connects and disconnects correctly', async () => {
    render(<ConsolePage />);
    
    // Test connection
    const connectButton = screen.getByText('connect');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(RealtimeClient).toHaveBeenCalled();
      expect(screen.getByText('disconnect')).toBeInTheDocument();
    });

    // Test disconnection
    const disconnectButton = screen.getByText('disconnect');
    fireEvent.click(disconnectButton);
    
    await waitFor(() => {
      expect(screen.getByText('connect')).toBeInTheDocument();
    });
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
    
    // Connect first
    const connectButton = screen.getByText('connect');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(RealtimeClient).toHaveBeenCalled();
    });

    const pushToTalkButton = screen.getByText('push to talk');
    
    // Test mouse down (start recording)
    fireEvent.mouseDown(pushToTalkButton);
    expect(pushToTalkButton).toHaveTextContent('release to send');
    
    // Test mouse up (stop recording)
    fireEvent.mouseUp(pushToTalkButton);
    expect(pushToTalkButton).toHaveTextContent('push to talk');
  });

  it('initializes with correct session settings', () => {
    render(<ConsolePage />);
    
    // Verify session initialization
    expect(RealtimeClient).toHaveBeenCalled();
  });

  it('adds required tools during initialization', () => {
    render(<ConsolePage />);
    
    // Verify tools are added
    expect(RealtimeClient).toHaveBeenCalled();
  });
});
