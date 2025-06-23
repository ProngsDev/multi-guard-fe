import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge, LoadingSpinner, AlertWithIcon } from '@/components/ui';
import { useWallet, useMultiSigOperations } from '@/hooks';
import { queryKeys } from '@/utils/queryClient';
import { formatAddress } from '@/utils/web3';
import { UsersIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';

const ManageSigners: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const multiSigOps = useMultiSigOperations(selectedWallet || undefined);

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
    isLoading: walletInfoLoading,
    error: walletInfoError 
  } = useQuery({
    queryKey: queryKeys.walletInfo(selectedWallet || ''),
    queryFn: () => multiSigOps.getWalletInfo(),
    enabled: !!selectedWallet,
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
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to manage signers.
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
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create a wallet first to manage signers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Signers</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage wallet owners and signing requirements
        </p>
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
                    {formatAddress(walletAddress)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Signer Details */}
        <div className="lg:col-span-3">
          {selectedWallet && (
            <>
              {walletInfoLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading wallet info...</span>
                  </CardContent>
                </Card>
              ) : walletInfoError ? (
                <AlertWithIcon variant="destructive" title="Error loading wallet">
                  {walletInfoError instanceof Error 
                    ? walletInfoError.message 
                    : 'Failed to load wallet info'}
                </AlertWithIcon>
              ) : walletInfo ? (
                <div className="space-y-6">
                  {/* Wallet Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Wallet Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {walletInfo.owners.length}
                          </div>
                          <div className="text-sm text-gray-600">Total Owners</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {walletInfo.threshold}
                          </div>
                          <div className="text-sm text-gray-600">Required Signatures</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round((walletInfo.threshold / walletInfo.owners.length) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Consensus Required</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Owners List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2" />
                        Wallet Owners
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {walletInfo.owners.map((owner, index) => (
                          <div
                            key={owner}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <UserIcon className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-mono text-sm font-medium text-gray-900">
                                  {formatAddress(owner)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Owner #{index + 1}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {owner.toLowerCase() === address?.toLowerCase() && (
                                <Badge variant="success">You</Badge>
                              )}
                              <Badge variant="secondary">Owner</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">
                            Multi-Signature Security
                          </h4>
                          <p className="text-sm text-blue-800">
                            This wallet requires {walletInfo.threshold} out of {walletInfo.owners.length} owners 
                            to approve any transaction. This provides enhanced security by requiring 
                            multiple parties to agree before funds can be moved.
                          </p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">
                            Important Notes
                          </h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Owner addresses cannot be changed after wallet creation</li>
                            <li>• The signature threshold cannot be modified</li>
                            <li>• All owners have equal voting power</li>
                            <li>• Lost access to owner accounts may affect wallet functionality</li>
                          </ul>
                        </div>

                        {!walletInfo.isOwner && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">
                              Access Level
                            </h4>
                            <p className="text-sm text-red-800">
                              You are not an owner of this wallet. You can view information 
                              but cannot approve or submit transactions.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSigners;
