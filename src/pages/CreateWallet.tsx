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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Multi-Sig Wallet</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new multi-signature wallet with custom owners and threshold
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Wallet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Owners Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Wallet Owners
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <div className="flex-1">
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
                        placeholder="0x..."
                        className={errors.owners?.[index]?.address ? 'border-red-500' : ''}
                      />
                      {errors.owners?.[index]?.address && (
                        <p className="mt-1 text-sm text-red-600">
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
                      className="flex-shrink-0"
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
                className="mt-3 flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Owner</span>
              </Button>

              {errors.owners && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.owners.message}
                </p>
              )}
            </div>

            {/* Threshold Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Threshold
              </label>
              <div className="flex items-center space-x-4">
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
                  className="w-24"
                />
                <span className="text-sm text-gray-600">
                  out of {validOwnersCount} owners
                </span>
              </div>
              {errors.threshold && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.threshold.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Number of confirmations required to execute a transaction
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {validOwnersCount} wallet owner(s)</li>
                <li>• {watchedThreshold} confirmation(s) required</li>
                <li>• Each transaction needs {watchedThreshold}/{validOwnersCount} approvals</li>
              </ul>
            </div>

            {/* Error Display */}
            {createWalletMutation.error && (
              <AlertWithIcon variant="destructive" title="Error creating wallet">
                {createWalletMutation.error instanceof Error 
                  ? createWalletMutation.error.message 
                  : 'An unexpected error occurred'}
              </AlertWithIcon>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWalletMutation.isPending || validOwnersCount === 0}
                className="flex-1"
              >
                {createWalletMutation.isPending ? 'Creating...' : 'Create Wallet'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWallet;
