import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { formatAddress } from '@/utils/web3';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon,
  PlayIcon 
} from '@heroicons/react/24/outline';
import type { PendingTransaction } from '@/types';

interface TransactionCardProps {
  transaction: PendingTransaction;
  onConfirm?: () => void;
  onExecute?: () => void;
  isLoading?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onConfirm, 
  onExecute,
  isLoading = false 
}) => {
  const getStatusBadge = () => {
    if (transaction.executed) {
      return <Badge variant="success">Executed</Badge>;
    }
    if (transaction.canExecute) {
      return <Badge variant="warning">Ready to Execute</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getProgressPercentage = () => {
    return Math.round((transaction.confirmations / transaction.threshold) * 100);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Transaction #{transaction.index}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">To:</span>
            <span className="font-mono text-sm">
              {formatAddress(transaction.to)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Value:</span>
            <span className="font-semibold">
              {transaction.value} ETH
            </span>
          </div>

          {transaction.data && transaction.data !== '0x' && (
            <div>
              <span className="text-sm text-gray-600">Data:</span>
              <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                {transaction.data.slice(0, 100)}
                {transaction.data.length > 100 && '...'}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confirmations</span>
            <span className="font-medium">
              {transaction.confirmations}/{transaction.threshold}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {!transaction.executed && (
          <div className="flex space-x-2 pt-2">
            {!transaction.isConfirmedByUser && onConfirm && (
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2"
                size="sm"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Confirm</span>
              </Button>
            )}
            
            {transaction.canExecute && onExecute && (
              <Button
                onClick={onExecute}
                disabled={isLoading}
                variant="default"
                className="flex-1 flex items-center justify-center space-x-2"
                size="sm"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Execute</span>
              </Button>
            )}

            {transaction.isConfirmedByUser && !transaction.canExecute && (
              <div className="flex-1 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Waiting for more confirmations</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { TransactionCard };
