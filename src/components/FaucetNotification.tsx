import React, { useState } from 'react';
import { AlertWithIcon, Button } from '@/components/ui';
import { useNetworkValidation } from '@/hooks/useNetworkValidation';
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  ExternalLinkIcon 
} from '@heroicons/react/24/outline';

interface FaucetNotificationProps {
  className?: string;
}

export const FaucetNotification: React.FC<FaucetNotificationProps> = ({ 
  className 
}) => {
  const { isValidNetwork, currentChainId } = useNetworkValidation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show on Sepolia testnet (11155111)
  const isTestnet = currentChainId === 11155111;
  
  // Don't show if not on valid network, not on testnet, or dismissed
  if (!isValidNetwork || !isTestnet || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const openFaucet = () => {
    window.open('https://cloud.google.com/application/web3/faucet/ethereum/sepolia', '_blank');
  };

  return (
    <div className={className}>
      <AlertWithIcon
        variant="info"
        title="Need Test ETH?"
        className="mb-4 relative"
      >
        <div className="space-y-3">
          <p className="text-sm">
            You're connected to <strong>Sepolia Testnet</strong>. If you need test ETH to interact 
            with contracts, you can get free tokens from a faucet.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={openFaucet}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <CurrencyDollarIcon className="w-4 h-4" />
              Get Test ETH
              <ExternalLinkIcon className="w-3 h-3" />
            </Button>
          </div>

          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded-lg">
            <p className="font-medium mb-1">💡 Recommended Faucets:</p>
            <ul className="space-y-1">
              <li>• <strong>Google Cloud Sepolia Faucet</strong> - Reliable and fast</li>
              <li>• Requires Google account verification</li>
              <li>• Provides sufficient ETH for testing</li>
            </ul>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="w-4 h-4 text-blue-600" />
        </button>
      </AlertWithIcon>
    </div>
  );
};

export default FaucetNotification;
