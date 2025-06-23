import React from 'react';
import { Button } from '@/components/ui';
import { useWallet } from '@/hooks';
import { formatAddress } from '@/utils/web3';
import { WalletIcon } from '@heroicons/react/24/outline';

interface LandingHeaderProps {
  onGetStarted?: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onGetStarted }) => {
  const { isConnected, address, connect, disconnect, isLoading } = useWallet();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      connect();
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <WalletIcon className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              MultiGuard
            </h1>
          </div>

          {/* Navigation - Hidden on mobile, shown on larger screens */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Features
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              About
            </a>
            <a 
              href="#getting-started" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Get Started
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-600">Connected:</span>
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {formatAddress(address)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <WalletIcon className="h-4 w-4" />
                <span>{isLoading ? 'Connecting...' : 'Get Started'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { LandingHeader };
