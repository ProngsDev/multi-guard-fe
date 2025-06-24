import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, AlertWithIcon } from '@/components/ui';
import { TransactionCard } from '@/components/wallet';
import { useWallet, useMultiSigOperations } from '@/hooks';
import { queryKeys } from '@/utils/queryClient';
import { ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const PendingTransactions: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const multiSigOps = useMultiSigOperations(selectedWallet || undefined);
  const queryClient = useQueryClient();

  // Fetch user's wallets
  const { 
    data: userWallets = [], 
    isLoading: walletsLoading 
  } = useQuery({
    queryKey: queryKeys.userWallets(address || ''),
    queryFn: () => multiSigOps.getUserWallets(),
    enabled: !!address && isConnected,
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Confirm transaction mutation
  const confirmMutation = useMutation({
    mutationFn: (txIndex: number) => multiSigOps.confirmTransaction(txIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.transactions(selectedWallet || '') 
      });
    },
  });

  // Execute transaction mutation
  const executeMutation = useMutation({
    mutationFn: (txIndex: number) => multiSigOps.executeTransaction(txIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.transactions(selectedWallet || '') 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.walletInfo(selectedWallet || '') 
      });
    },
  });

  // Auto-select first wallet if available
  React.useEffect(() => {
    if (userWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(userWallets[0]);
    }
  }, [userWallets, selectedWallet]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to view pending transactions.
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

  if (userWallets.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create a wallet first to manage transactions.
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

  const handleConfirm = async (txIndex: number) => {
    try {
      await confirmMutation.mutateAsync(txIndex);
    } catch (error) {
      console.error('Error confirming transaction:', error);
    }
  };

  const handleExecute = async (txIndex: number) => {
    try {
      await executeMutation.mutateAsync(txIndex);
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Pending Transactions</h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Review and manage pending multi-signature transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/create-transaction">
            <Button size="lg" className="flex items-center gap-2 shadow-lg">
              <PlusIcon className="h-5 w-5" />
              <span>New Transaction</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Enhanced Wallet Selection */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-orange-600" />
                Select Wallet
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

        {/* Enhanced Transactions List */}
        <div className="lg:col-span-3">
          {selectedWallet && (
            <>
              {transactionsLoading ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center space-y-3">
                      <LoadingSpinner size="lg" />
                      <p className="text-neutral-600 font-medium">Loading pending transactions...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : transactionsError ? (
                <AlertWithIcon variant="destructive" title="Error loading transactions">
                  {transactionsError instanceof Error
                    ? transactionsError.message
                    : 'Failed to load transactions'}
                </AlertWithIcon>
              ) : pendingTransactions.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="text-center py-16">
                    <div className="mx-auto h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                      <ClockIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      No pending transactions
                    </h3>
                    <p className="text-neutral-600 max-w-md mx-auto leading-relaxed mb-6">
                      All transactions have been executed or there are no pending transactions for this wallet.
                    </p>
                    <Link to="/create-transaction">
                      <Button variant="outline" size="lg">
                        Create New Transaction
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {pendingTransactions.filter(tx => !tx.executed).length} Pending Transaction{pendingTransactions.filter(tx => !tx.executed).length !== 1 ? 's' : ''}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {pendingTransactions
                      .filter(tx => !tx.executed)
                      .map((transaction) => (
                        <TransactionCard
                          key={transaction.index}
                          transaction={transaction}
                          onConfirm={() => handleConfirm(transaction.index)}
                          onExecute={() => handleExecute(transaction.index)}
                          isLoading={
                            confirmMutation.isPending ||
                            executeMutation.isPending
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {confirmMutation.error && (
                <AlertWithIcon variant="destructive" title="Error confirming transaction">
                  {confirmMutation.error instanceof Error 
                    ? confirmMutation.error.message 
                    : 'Failed to confirm transaction'}
                </AlertWithIcon>
              )}

              {executeMutation.error && (
                <AlertWithIcon variant="destructive" title="Error executing transaction">
                  {executeMutation.error instanceof Error 
                    ? executeMutation.error.message 
                    : 'Failed to execute transaction'}
                </AlertWithIcon>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingTransactions;
