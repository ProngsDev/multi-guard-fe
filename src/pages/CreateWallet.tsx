import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, AlertWithIcon } from '@/components/ui';
import { useMultiSigOperations } from '@/hooks';
import { queryKeys } from '@/utils/queryClient';
import { isValidAddress } from '@/utils/web3';
import { PlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface CreateWalletForm {
  owners: { address: string }[];
  threshold: number;
}

const CreateWallet: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const multiSigOps = useMultiSigOperations();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<CreateWalletForm>({
    defaultValues: {
      owners: [{ address: '' }],
      threshold: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'owners',
  });

  const watchedOwners = watch('owners');
  const watchedThreshold = watch('threshold');

  const createWalletMutation = useMutation({
    mutationFn: async (data: CreateWalletForm) => {
      const owners = data.owners.map(o => o.address).filter(Boolean);
      
      // Validate addresses
      for (const address of owners) {
        if (!isValidAddress(address)) {
          throw new Error(`Invalid address: ${address}`);
        }
      }

      // Check for duplicates
      const uniqueOwners = new Set(owners);
      if (uniqueOwners.size !== owners.length) {
        throw new Error('Duplicate addresses are not allowed');
      }

      // Validate threshold
      if (data.threshold < 1 || data.threshold > owners.length) {
        throw new Error('Threshold must be between 1 and the number of owners');
      }

      const walletAddress = await multiSigOps.createWallet({
        owners,
        threshold: data.threshold,
      });

      if (!walletAddress) {
        throw new Error('Failed to create wallet');
      }

      return walletAddress;
    },
    onSuccess: (walletAddress) => {
      // Invalidate and refetch user wallets
      queryClient.invalidateQueries({ queryKey: queryKeys.userWallets('') });
      
      // Navigate to dashboard
      navigate('/', { 
        state: { 
          message: `Wallet created successfully! Address: ${walletAddress}`,
          type: 'success' 
        } 
      });
    },
    onError: (error) => {
      console.error('Error creating wallet:', error);
    },
  });

  const onSubmit = (data: CreateWalletForm) => {
    // Clear previous errors
    const validOwners = data.owners.filter(o => o.address.trim() !== '');
    
    if (validOwners.length === 0) {
      setError('owners', { message: 'At least one owner is required' });
      return;
    }

    createWalletMutation.mutate({
      ...data,
      owners: validOwners,
    });
  };

  const addOwner = () => {
    append({ address: '' });
  };

  const removeOwner = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const validOwnersCount = watchedOwners.filter(o => o.address.trim() !== '').length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
          <UsersIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Create Multi-Signature Wallet</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Set up a new multi-signature wallet with custom owners and confirmation requirements for enhanced security
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            Wallet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Enhanced Owners Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-neutral-900">
                    Wallet Owners
                  </label>
                  <p className="text-sm text-neutral-600">Add Ethereum addresses that will control this wallet</p>
                </div>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          {...register(`owners.${index}.address`, {
                            validate: (value) => {
                              if (!value.trim()) return true; // Allow empty for removal
                              if (!isValidAddress(value)) {
                                return 'Invalid Ethereum address';
                              }
                              return true;
                            },
                          })}
                          placeholder="0x1234567890abcdef1234567890abcdef12345678"
                          className={`${errors.owners?.[index]?.address ? 'border-red-300 focus-visible:ring-red-500' : ''} font-mono text-sm`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                          Owner {index + 1}
                        </div>
                      </div>
                      {errors.owners?.[index]?.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                          {errors.owners[index]?.address?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOwner(index)}
                      disabled={fields.length === 1}
                      className="flex-shrink-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addOwner}
                className="mt-4 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Another Owner</span>
              </Button>

              {errors.owners && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                  {errors.owners.message}
                </p>
              )}
            </div>

            {/* Enhanced Threshold Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">#</span>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-neutral-900">
                    Confirmation Threshold
                  </label>
                  <p className="text-sm text-neutral-600">How many owners must approve each transaction</p>
                </div>
              </div>
              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max={validOwnersCount || 1}
                      {...register('threshold', {
                        required: 'Threshold is required',
                        min: { value: 1, message: 'Threshold must be at least 1' },
                        max: {
                          value: validOwnersCount || 1,
                          message: 'Threshold cannot exceed number of owners'
                        },
                        valueAsNumber: true,
                      })}
                      className="w-20 text-center font-semibold text-lg"
                    />
                    <span className="text-lg text-neutral-600 font-medium">
                      out of {validOwnersCount} owners
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-neutral-600">
                      Security Level: <span className="font-semibold text-neutral-900">
                        {validOwnersCount > 0 ? Math.round((watchedThreshold / validOwnersCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                {errors.threshold && (
                  <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {errors.threshold.message}
                  </p>
                )}
                <p className="mt-3 text-sm text-neutral-600">
                  Each transaction will require approval from at least {watchedThreshold} owner{watchedThreshold !== 1 ? 's' : ''} before it can be executed
                </p>
              </div>
            </div>

            {/* Enhanced Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">✓</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">Wallet Summary</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{validOwnersCount}</div>
                  <div className="text-sm text-neutral-600">Total Owners</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{watchedThreshold}</div>
                  <div className="text-sm text-neutral-600">Required Signatures</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {validOwnersCount > 0 ? Math.round((watchedThreshold / validOwnersCount) * 100) : 0}%
                  </div>
                  <div className="text-sm text-neutral-600">Security Level</div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {createWalletMutation.error && (
              <AlertWithIcon variant="destructive" title="Error creating wallet">
                {createWalletMutation.error instanceof Error 
                  ? createWalletMutation.error.message 
                  : 'An unexpected error occurred'}
              </AlertWithIcon>
            )}

            {/* Enhanced Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWalletMutation.isPending || validOwnersCount === 0}
                size="lg"
                className="flex-1 shadow-lg"
              >
                {createWalletMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating Wallet...
                  </div>
                ) : (
                  'Create Wallet'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWallet;
