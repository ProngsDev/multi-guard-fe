import React from 'react';
import { Button, CopyableAddress } from '@/components/ui';
import { useWallet } from '@/hooks';
import { WalletIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { isConnected, address, connect, disconnect, isLoading } = useWallet();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo and Menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  MultiGuard
                </h1>
                <p className="text-xs text-neutral-500 font-medium">Multi-Sig Wallet</p>
              </div>
            </div>
          </div>

          {/* Enhanced Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-700 font-medium">Connected</span>
                  <CopyableAddress
                    address={address}
                    truncate={true}
                    label="connected wallet address"
                    variant="inline"
                    copyButtonSize="sm"
                    className="text-sm font-semibold text-green-800"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  disabled={isLoading}
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={isLoading}
                size="default"
                className="flex items-center gap-2 shadow-lg"
              >
                <WalletIcon className="h-4 w-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
