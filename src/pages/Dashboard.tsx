import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, AlertWithIcon } from '@/components/ui';
import { WalletCard, TransactionCard } from '@/components/wallet';
import { useWallet, useMultiSigOperations } from '@/hooks';
import { queryKeys } from '@/utils/queryClient';
import { PlusIcon, WalletIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const multiSigOps = useMultiSigOperations(selectedWallet || undefined);

  // Fetch user's wallets
  const { 
    data: userWallets = [], 
    isLoading: walletsLoading, 
    error: walletsError 
  } = useQuery({
    queryKey: queryKeys.userWallets(address || ''),
    queryFn: () => multiSigOps.getUserWallets(),
    enabled: !!address && isConnected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch selected wallet info
  const { 
    data: walletInfo, 
    isLoading: walletInfoLoading,
    error: walletInfoError 
  } = useQuery({
    queryKey: queryKeys.walletInfo(selectedWallet || ''),
    queryFn: () => multiSigOps.getWalletInfo(),
    enabled: !!selectedWallet,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Fetch pending transactions
  const { 
    data: pendingTransactions = [], 
    isLoading: transactionsLoading,
    error: transactionsError 
  } = useQuery({
    queryKey: queryKeys.transactions(selectedWallet || ''),
    queryFn: () => multiSigOps.getPendingTransactions(),
    enabled: !!selectedWallet,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Auto-select first wallet if available
  useEffect(() => {
    if (userWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(userWallets[0]);
    }
  }, [userWallets, selectedWallet]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to view and manage your multi-signature wallets.
        </p>
      </div>
    );
  }

  if (walletsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading wallets...</span>
      </div>
    );
  }

  if (walletsError) {
    return (
      <AlertWithIcon variant="destructive" title="Error loading wallets">
        {walletsError instanceof Error ? walletsError.message : 'Failed to load wallets'}
      </AlertWithIcon>
    );
  }

  if (userWallets.length === 0) {
    return (
      <div className="text-center py-12">
        <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first multi-signature wallet.
        </p>
        <div className="mt-6">
          <Link to="/create">
            <Button className="flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Wallet</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Manage your multi-signature wallets and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/create">
            <Button size="lg" className="flex items-center gap-2 shadow-lg">
              <PlusIcon className="h-5 w-5" />
              <span>Create Wallet</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Wallet Selection */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-blue-600" />
                Your Wallets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userWallets.map((walletAddress) => (
                <div
                  key={walletAddress}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedWallet === walletAddress
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-blue-100/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                  }`}
                  onClick={() => setSelectedWallet(walletAddress)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-medium text-neutral-900">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    {selectedWallet === walletAddress && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Wallet Details and Transactions */}
        <div className="lg:col-span-2 space-y-8">
          {selectedWallet && (
            <>
              {/* Enhanced Wallet Info */}
              {walletInfoLoading ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <LoadingSpinner size="lg" />
                      <p className="text-neutral-600 font-medium">Loading wallet information...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : walletInfoError ? (
                <AlertWithIcon variant="destructive" title="Error loading wallet">
                  {walletInfoError instanceof Error ? walletInfoError.message : 'Failed to load wallet info'}
                </AlertWithIcon>
              ) : walletInfo ? (
                <WalletCard wallet={walletInfo} />
              ) : null}

              {/* Enhanced Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Link to="/pending">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-3">
                        <LoadingSpinner size="lg" />
                        <p className="text-neutral-600 font-medium">Loading recent transactions...</p>
                      </div>
                    </div>
                  ) : transactionsError ? (
                    <AlertWithIcon variant="destructive" title="Error loading transactions">
                      {transactionsError instanceof Error ? transactionsError.message : 'Failed to load transactions'}
                    </AlertWithIcon>
                  ) : pendingTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                        <WalletIcon className="h-6 w-6 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">No transactions yet</h3>
                      <p className="text-neutral-500 mb-6">Start by creating your first transaction</p>
                      <Link to="/create-transaction">
                        <Button variant="outline">Create Transaction</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingTransactions.slice(0, 3).map((tx) => (
                        <TransactionCard
                          key={tx.index}
                          transaction={tx}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Enhanced No wallet selected state */}
      {!selectedWallet && userWallets.length > 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <WalletIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Select a wallet to get started
            </h3>
            <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
              Choose a wallet from the list on the left to view its details, balance, and recent transactions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced No wallets state */}
      {userWallets.length === 0 && !walletsLoading && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-16">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
              <WalletIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              Welcome to MultiGuard
            </h3>
            <p className="text-neutral-600 max-w-lg mx-auto leading-relaxed mb-8">
              Get started by creating your first multi-signature wallet. Secure your assets with the power of collaborative ownership and enhanced security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button size="lg" className="flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Wallet
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
