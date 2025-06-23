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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your multi-signature wallets and transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/create">
            <Button className="flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Wallet</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userWallets.map((walletAddress) => (
                <div
                  key={walletAddress}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWallet === walletAddress
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWallet(walletAddress)}
                >
                  <p className="font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Wallet Details and Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWallet && (
            <>
              {/* Wallet Info */}
              {walletInfoLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600">Loading wallet info...</span>
                  </CardContent>
                </Card>
              ) : walletInfoError ? (
                <AlertWithIcon variant="destructive" title="Error loading wallet">
                  {walletInfoError instanceof Error ? walletInfoError.message : 'Failed to load wallet info'}
                </AlertWithIcon>
              ) : walletInfo ? (
                <WalletCard wallet={walletInfo} />
              ) : null}

              {/* Recent Transactions */}
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
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600">Loading transactions...</span>
                    </div>
                  ) : transactionsError ? (
                    <AlertWithIcon variant="destructive" title="Error loading transactions">
                      {transactionsError instanceof Error ? transactionsError.message : 'Failed to load transactions'}
                    </AlertWithIcon>
                  ) : pendingTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pending transactions</p>
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
    </div>
  );
};

export default Dashboard;
