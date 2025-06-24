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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-6">
          <PaperAirplaneIcon className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Create Transaction</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Submit a new transaction to your multi-signature wallet for approval
        </p>
      </div>

      <div className="space-y-8">
        {/* Enhanced Wallet Selection */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <PaperAirplaneIcon className="h-5 w-5 text-green-600" />
              </div>
              Select Source Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {userWallets.map((walletAddress) => (
                <div
                  key={walletAddress}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedWallet === walletAddress
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-green-100/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                  }`}
                  onClick={() => handleWalletSelect(walletAddress)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${selectedWallet === walletAddress ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                      <p className="font-mono text-sm font-medium text-neutral-900">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {walletInfoLoading && selectedWallet === walletAddress ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                      ) : walletInfo && selectedWallet === walletAddress ? (
                        <div className="text-right">
                          <span className="text-lg font-semibold text-neutral-900">
                            {walletInfo.balance} ETH
                          </span>
                          <p className="text-xs text-neutral-500">Available Balance</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Transaction Form */}
        {selectedWallet && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
                </div>
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Enhanced Recipient Address */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">→</span>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-neutral-900">
                        Recipient Address
                      </label>
                      <p className="text-sm text-neutral-600">Enter the destination Ethereum address</p>
                    </div>
                  </div>
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
                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                    className={`font-mono ${errors.to ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.to && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                      {errors.to.message}
                    </p>
                  )}
                </div>

                {/* Enhanced Amount */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">Ξ</span>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-neutral-900">
                        Amount (ETH)
                      </label>
                      <p className="text-sm text-neutral-600">How much ETH to send</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.000000000000000001"
                      min="0"
                      {...register('value', {
                        required: 'Amount is required',
                        min: { value: 0, message: 'Amount must be positive' },
                      })}
                      placeholder="0.0"
                      className={`text-lg font-semibold ${errors.value ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-medium">
                      ETH
                    </div>
                  </div>
                  {errors.value && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                      {errors.value.message}
                    </p>
                  )}
                  {walletInfo && (
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Available Balance:</span> {walletInfo.balance} ETH
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Data Field */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{}</span>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-neutral-900">
                        Transaction Data <span className="text-sm font-normal text-neutral-500">(Optional)</span>
                      </label>
                      <p className="text-sm text-neutral-600">Contract call data for advanced transactions</p>
                    </div>
                  </div>
                  <Input
                    {...register('data')}
                    placeholder="0x"
                    className="font-mono text-sm"
                  />
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">💡 Tip:</span> Leave as "0x" for simple ETH transfers. Add contract call data for smart contract interactions.
                    </p>
                  </div>
                </div>

                {/* Enhanced Summary */}
                {walletInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <h4 className="text-lg font-semibold text-neutral-900">Transaction Summary</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">From</p>
                          <p className="font-mono text-sm font-medium text-neutral-900">
                            {selectedWallet.slice(0, 6)}...{selectedWallet.slice(-4)}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">To</p>
                          <p className="font-mono text-sm font-medium text-neutral-900">
                            {watch('to') ? `${watch('to').slice(0, 6)}...${watch('to').slice(-4)}` : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Amount</p>
                          <p className="text-lg font-bold text-green-600">
                            {watch('value') || '0'} ETH
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Required Signatures</p>
                          <p className="text-lg font-bold text-purple-600">
                            {walletInfo.threshold}/{walletInfo.owners.length}
                          </p>
                        </div>
                      </div>
                    </div>
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

                {/* Enhanced Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/pending')}
                    size="lg"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitTransactionMutation.isPending}
                    size="lg"
                    className="flex-1 shadow-lg"
                  >
                    {submitTransactionMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Submitting Transaction...
                      </div>
                    ) : (
                      'Submit Transaction'
                    )}
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
