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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage pending multi-signature transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Wallet Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Wallet</CardTitle>
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

        {/* Transactions List */}
        <div className="lg:col-span-3">
          {selectedWallet && (
            <>
              {transactionsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading transactions...</span>
                  </CardContent>
                </Card>
              ) : transactionsError ? (
                <AlertWithIcon variant="destructive" title="Error loading transactions">
                  {transactionsError instanceof Error 
                    ? transactionsError.message 
                    : 'Failed to load transactions'}
                </AlertWithIcon>
              ) : pendingTransactions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No pending transactions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All transactions have been executed or there are no pending transactions.
                    </p>
                  </CardContent>
                </Card>
              ) : (
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
