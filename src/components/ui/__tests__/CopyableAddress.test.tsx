import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyableAddress } from '../CopyableAddress';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true,
});

describe('CopyableAddress', () => {
  const testAddress = '0x1234567890abcdef1234567890abcdef12345678';

  beforeEach(() => {
    mockWriteText.mockClear();
  });

  it('renders truncated address by default', () => {
    render(<CopyableAddress address={testAddress} />);
    
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('renders full address when truncate is false', () => {
    render(<CopyableAddress address={testAddress} truncate={false} />);
    
    expect(screen.getByText(testAddress)).toBeInTheDocument();
  });

  it('shows copy button by default', () => {
    render(<CopyableAddress address={testAddress} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/copy/i)).toBeInTheDocument();
  });

  it('hides copy button when showCopyButton is false', () => {
    render(<CopyableAddress address={testAddress} showCopyButton={false} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('copies full address to clipboard when copy button is clicked', async () => {
    render(<CopyableAddress address={testAddress} />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testAddress);
    });
  });

  it('shows success state after successful copy', async () => {
    mockWriteText.mockResolvedValue(undefined);
    render(<CopyableAddress address={testAddress} />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/copied/i)).toBeInTheDocument();
    });
  });

  it('handles copy failure gracefully', async () => {
    mockWriteText.mockRejectedValue(new Error('Copy failed'));
    render(<CopyableAddress address={testAddress} />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/failed to copy/i)).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<CopyableAddress address={testAddress} />);
    
    const copyButton = screen.getByRole('button');
    copyButton.focus();
    fireEvent.keyDown(copyButton, { key: 'Enter' });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testAddress);
    });
  });

  it('calls onCopy callback when provided', async () => {
    const onCopy = jest.fn();
    render(<CopyableAddress address={testAddress} onCopy={onCopy} />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith(testAddress);
    });
  });

  it('applies custom className', () => {
    render(<CopyableAddress address={testAddress} className="custom-class" />);
    
    expect(screen.getByText('0x1234...5678').closest('div')).toHaveClass('custom-class');
  });

  it('shows custom label in button title', () => {
    render(<CopyableAddress address={testAddress} label="wallet address" />);
    
    const copyButton = screen.getByRole('button');
    expect(copyButton).toHaveAttribute('title', 'Copy wallet address');
  });
});
