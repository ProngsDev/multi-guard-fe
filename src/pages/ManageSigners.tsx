import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge, LoadingSpinner, AlertWithIcon, CopyableAddress } from '@/components/ui';
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
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
          <UsersIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Manage Signers</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          View and manage wallet owners and signing requirements for enhanced security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Enhanced Wallet Selection */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                Select Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userWallets.map((walletAddress) => (
                <div
                  key={walletAddress}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedWallet === walletAddress
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-purple-100/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                  }`}
                  onClick={() => setSelectedWallet(walletAddress)}
                >
                  <div className="flex items-center justify-between">
                    <CopyableAddress
                      address={walletAddress}
                      truncate={true}
                      label="wallet address"
                      variant="inline"
                      copyButtonSize="sm"
                      className="font-medium text-neutral-900"
                    />
                    {selectedWallet === walletAddress && (
                      <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 ml-2"></div>
                    )}
                  </div>
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
                  {/* Enhanced Wallet Overview */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        Wallet Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {walletInfo.owners.length}
                          </div>
                          <div className="text-sm font-medium text-blue-800">Total Owners</div>
                          <div className="text-xs text-blue-600 mt-1">Active Signers</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {walletInfo.threshold}
                          </div>
                          <div className="text-sm font-medium text-green-800">Required Signatures</div>
                          <div className="text-xs text-green-600 mt-1">For Execution</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {Math.round((walletInfo.threshold / walletInfo.owners.length) * 100)}%
                          </div>
                          <div className="text-sm font-medium text-purple-800">Consensus Required</div>
                          <div className="text-xs text-purple-600 mt-1">Security Level</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Owners List */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-green-600" />
                        </div>
                        Wallet Owners
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        {walletInfo.owners.map((owner, index) => (
                          <div
                            key={owner}
                            className="flex items-center justify-between p-6 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-blue-600" />
                                </div>
                              </div>
                              <div>
                                <CopyableAddress
                                  address={owner}
                                  truncate={true}
                                  label={`owner ${index + 1} address`}
                                  variant="inline"
                                  copyButtonSize="sm"
                                  className="font-semibold text-neutral-900"
                                />
                                <p className="text-sm text-neutral-600 font-medium">
                                  Owner #{index + 1}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {owner.toLowerCase() === address?.toLowerCase() && (
                                <Badge variant="success" size="lg">
                                  <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                                    You
                                  </span>
                                </Badge>
                              )}
                              <Badge variant="premium" size="lg">Owner</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Security Information */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ShieldCheckIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        Security Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-3 text-lg">
                                Multi-Signature Security
                              </h4>
                              <p className="text-sm text-blue-800 leading-relaxed">
                                This wallet requires <span className="font-bold">{walletInfo.threshold} out of {walletInfo.owners.length} owners</span> to approve any transaction.
                                This provides enhanced security by requiring multiple parties to agree before funds can be moved,
                                protecting against single points of failure and unauthorized access.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-yellow-600 font-bold text-sm">!</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-yellow-900 mb-3 text-lg">
                                Important Considerations
                              </h4>
                              <ul className="text-sm text-yellow-800 space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></span>
                                  Owner addresses cannot be changed after wallet creation
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></span>
                                  The signature threshold cannot be modified
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></span>
                                  All owners have equal voting power
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></span>
                                  Lost access to owner accounts may affect wallet functionality
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {!walletInfo.isOwner && (
                          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-red-600 font-bold text-sm">⚠</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-900 mb-3 text-lg">
                                  Limited Access Level
                                </h4>
                                <p className="text-sm text-red-800 leading-relaxed">
                                  You are not an owner of this wallet. You can view information but cannot approve or submit transactions.
                                  Contact one of the wallet owners if you need to perform transactions.
                                </p>
                              </div>
                            </div>
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
