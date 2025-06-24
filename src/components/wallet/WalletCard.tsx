import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, CopyableAddress } from '@/components/ui';
import { WalletIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { WalletInfo } from '@/types';

interface WalletCardProps {
  wallet: WalletInfo;
  onSelect?: () => void;
  isSelected?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({ 
  wallet, 
  onSelect, 
  isSelected = false 
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <WalletIcon className="h-5 w-5 mr-2 text-blue-600" />
            Multi-Sig Wallet
          </CardTitle>
          {wallet.isOwner && (
            <Badge variant="success" className="text-xs">
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
          <CopyableAddress
            address={wallet.address}
            variant="card"
            truncate={true}
            label="wallet address"
            className="w-full"
          />
        </div>

        {/* Balance */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {wallet.balance} ETH
          </p>
        </div>

        {/* Owners and Threshold */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{wallet.owners.length} owners</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            <span>{wallet.threshold} required</span>
          </div>
        </div>

        {/* Action Button */}
        {onSelect && (
          <Button 
            className="w-full mt-4" 
            variant={isSelected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? 'Selected' : 'Select Wallet'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export { WalletCard };
