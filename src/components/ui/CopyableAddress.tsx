import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { formatAddress } from '@/utils/web3';

const copyableAddressVariants = cva(
  'inline-flex items-center gap-2 font-mono text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-neutral-900',
        muted: 'text-neutral-600',
        card: 'bg-neutral-50 p-2 rounded border',
        inline: 'text-neutral-800',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface CopyableAddressProps extends VariantProps<typeof copyableAddressVariants> {
  address: string;
  truncate?: boolean;
  showCopyButton?: boolean;
  className?: string;
  copyButtonSize?: 'sm' | 'default' | 'lg';
  onCopy?: (address: string) => void;
  label?: string;
}

const CopyableAddress: React.FC<CopyableAddressProps> = ({
  address,
  truncate = true,
  showCopyButton = true,
  variant,
  size,
  className,
  copyButtonSize = 'sm',
  onCopy,
  label,
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const displayAddress = truncate ? formatAddress(address) : address;

  const copyToClipboard = async () => {
    if (!address) return;

    setCopyState('copying');

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopyState('success');
      onCopy?.(address);

      // Reset state after 2 seconds
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      setCopyState('error');
      
      // Reset state after 3 seconds
      setTimeout(() => setCopyState('idle'), 3000);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      copyToClipboard();
    }
  };

  const getCopyButtonContent = () => {
    switch (copyState) {
      case 'copying':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-blue-600" />
        );
      case 'success':
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'error':
        return <ClipboardDocumentIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClipboardDocumentIcon className="h-4 w-4" />;
    }
  };

  const getCopyButtonVariant = () => {
    switch (copyState) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      default:
        return 'ghost';
    }
  };

  const getCopyButtonTitle = () => {
    switch (copyState) {
      case 'copying':
        return 'Copying...';
      case 'success':
        return 'Copied!';
      case 'error':
        return 'Failed to copy';
      default:
        return `Copy ${label || 'address'}`;
    }
  };

  return (
    <div className={cn(copyableAddressVariants({ variant, size }), className)}>
      <span 
        className={cn(
          'select-all break-all',
          variant === 'card' && 'flex-1'
        )}
        title={truncate ? address : undefined}
      >
        {displayAddress}
      </span>
      
      {showCopyButton && (
        <Button
          variant={getCopyButtonVariant()}
          size={copyButtonSize === 'sm' ? 'icon-sm' : copyButtonSize === 'lg' ? 'icon-lg' : 'icon-sm'}
          onClick={copyToClipboard}
          onKeyDown={handleKeyDown}
          disabled={copyState === 'copying'}
          title={getCopyButtonTitle()}
          className={cn(
            'flex-shrink-0 transition-all duration-200',
            copyState === 'success' && 'bg-green-50 border-green-200 hover:bg-green-100',
            copyState === 'error' && 'bg-red-50 border-red-200 hover:bg-red-100'
          )}
          aria-label={getCopyButtonTitle()}
        >
          {getCopyButtonContent()}
        </Button>
      )}
      
      {/* Screen reader feedback */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copyState === 'success' && `${label || 'Address'} copied to clipboard`}
        {copyState === 'error' && `Failed to copy ${label || 'address'}`}
      </div>
    </div>
  );
};

export { CopyableAddress };
export type { CopyableAddressProps };
