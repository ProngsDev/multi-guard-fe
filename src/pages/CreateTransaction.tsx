import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, AlertWithIcon } from '@/components/ui';
import { useWallet, useMultiSigOperations } from '@/hooks';
import { queryKeys } from '@/utils/queryClient';
import { isValidAddress, parseEther } from '@/utils/web3';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface CreateTransactionForm {
  walletAddress: string;
  to: string;
  value: string;
  data: string;
}

const CreateTransaction: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isConnected, address } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const multiSigOps = useMultiSigOperations(selectedWallet || undefined);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateTransactionForm>({
    defaultValues: {
      walletAddress: '',
      to: '',
      value: '0',
      data: '0x',
    },
  });

  // Fetch user's wallets
  const { 
    data: userWallets = [], 
    isLoading: walletsLoading 
  } = useQuery({
    queryKey: queryKeys.userWallets(address || ''),
    queryFn: () => multiSigOps.getUserWallets(),
    enabled: !!address && isConnected,
  });

  // Fetch wallet info for selected wallet
  const { 
    data: walletInfo,
    isLoading: walletInfoLoading 
  } = useQuery({
    queryKey: queryKeys.walletInfo(selectedWallet),
    queryFn: () => multiSigOps.getWalletInfo(),
    enabled: !!selectedWallet,
  });

  const submitTransactionMutation = useMutation({
    mutationFn: async (data: CreateTransactionForm) => {
      if (!selectedWallet) {
        throw new Error('Please select a wallet');
      }

      if (!isValidAddress(data.to)) {
        throw new Error('Invalid recipient address');
      }

      const valueInWei = parseEther(data.value);
      if (valueInWei < 0) {
        throw new Error('Value must be positive');
      }

      const success = await multiSigOps.submitTransaction({
        to: data.to,
        value: data.value,
        data: data.data || '0x',
      });

      if (!success) {
        throw new Error('Failed to submit transaction');
      }

      return success;
    },
    onSuccess: () => {
      // Invalidate transactions query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.transactions(selectedWallet) 
      });
      
      // Navigate to pending transactions
      navigate('/pending', { 
        state: { 
          message: 'Transaction submitted successfully!',
          type: 'success' 
        } 
      });
    },
  });

  const onSubmit = (data: CreateTransactionForm) => {
    submitTransactionMutation.mutate(data);
  };

  const handleWalletSelect = (walletAddress: string) => {
    setSelectedWallet(walletAddress);
    setValue('walletAddress', walletAddress);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to create transactions.
        </p>
      </div>
    );
  }

  if (walletsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading wallets...</span>
      </div>
    );
  }

  if (userWallets.length === 0) {
    return (
      <div className="text-center py-12">
        <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create a wallet first to submit transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Transaction</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit a new transaction for multi-signature approval
        </p>
      </div>

      <div className="space-y-6">
        {/* Wallet Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {userWallets.map((walletAddress) => (
                <div
                  key={walletAddress}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedWallet === walletAddress
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleWalletSelect(walletAddress)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    {walletInfoLoading && selectedWallet === walletAddress ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : walletInfo && selectedWallet === walletAddress ? (
                      <span className="text-sm text-gray-600">
                        {walletInfo.balance} ETH
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Form */}
        {selectedWallet && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <Input
                    {...register('to', {
                      required: 'Recipient address is required',
                      validate: (value) => {
                        if (!isValidAddress(value)) {
                          return 'Invalid Ethereum address';
                        }
                        return true;
                      },
                    })}
                    placeholder="0x..."
                    className={errors.to ? 'border-red-500' : ''}
                  />
                  {errors.to && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.to.message}
                    </p>
                  )}
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (ETH)
                  </label>
                  <Input
                    type="number"
                    step="0.000000000000000001"
                    min="0"
                    {...register('value', {
                      required: 'Amount is required',
                      min: { value: 0, message: 'Amount must be positive' },
                    })}
                    placeholder="0.0"
                    className={errors.value ? 'border-red-500' : ''}
                  />
                  {errors.value && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.value.message}
                    </p>
                  )}
                  {walletInfo && (
                    <p className="mt-1 text-sm text-gray-500">
                      Wallet balance: {walletInfo.balance} ETH
                    </p>
                  )}
                </div>

                {/* Data (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data (Optional)
                  </label>
                  <Input
                    {...register('data')}
                    placeholder="0x"
                    className="font-mono"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Contract call data (leave as 0x for simple transfers)
                  </p>
                </div>

                {/* Summary */}
                {walletInfo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Transaction Summary</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• From: {selectedWallet.slice(0, 6)}...{selectedWallet.slice(-4)}</li>
                      <li>• To: {watch('to') ? `${watch('to').slice(0, 6)}...${watch('to').slice(-4)}` : 'Not specified'}</li>
                      <li>• Amount: {watch('value') || '0'} ETH</li>
                      <li>• Required confirmations: {walletInfo.threshold}/{walletInfo.owners.length}</li>
                    </ul>
                  </div>
                )}

                {/* Error Display */}
                {submitTransactionMutation.error && (
                  <AlertWithIcon variant="destructive" title="Error submitting transaction">
                    {submitTransactionMutation.error instanceof Error 
                      ? submitTransactionMutation.error.message 
                      : 'An unexpected error occurred'}
                  </AlertWithIcon>
                )}

                {/* Submit Button */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/pending')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitTransactionMutation.isPending}
                    className="flex-1"
                  >
                    {submitTransactionMutation.isPending ? 'Submitting...' : 'Submit Transaction'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateTransaction;
