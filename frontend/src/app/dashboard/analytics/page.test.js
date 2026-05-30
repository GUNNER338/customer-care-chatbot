import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsDashboard from './page';
import React from 'react';

// Mock the framer-motion library so animations do not interfere with tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => {
        // Strip out Framer Motion specific props and just render a normal div
        const { initial, animate, exit, variants, transition, whileHover, ...domProps } = props;
        return <div {...domProps}>{children}</div>;
      }
    }
  };
});

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    // Clear all mocks and mock localStorage
    jest.clearAllMocks();
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mocked-test-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    
    // Mock the global fetch
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/analytics/overview')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: { totalUsers: 150, totalConversations: 120, totalLeads: 55, totalCandidates: 20, totalEscalations: 5 } }),
        });
      }
      if (url.includes('/api/analytics/intents')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: { "job_inquiry": 40, "human_support": 10 } }),
        });
      }
      if (url.includes('/api/analytics/trends')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: [{ date: '2023-10-01', count: 5 }] }),
        });
      }
      if (url.includes('/api/analytics/leads')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: { new: 10, qualified: 5, converted: 2, rejected: 1 } }),
        });
      }
      return Promise.reject(new Error('not mocked'));
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('renders loading state and then fetches data to render dashboard', async () => {
    render(<AnalyticsDashboard />);

    // Wait for the "Intelligence Hub" title to appear, meaning loading is done
    await waitFor(() => {
      expect(screen.getByText('Intelligence Hub')).toBeInTheDocument();
    });

    // Check if the overview cards loaded correctly
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument(); // totalUsers
    
    expect(screen.getByText('Employer Leads')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument(); // totalLeads

    // Check if the Detailed Intent Breakdown table headers loaded
    expect(screen.getByText('Detailed Intent Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Intent Name')).toBeInTheDocument();
    
    // Check if the mocked intent data rendered in the table
    expect(screen.getByText('job inquiry')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });
});
