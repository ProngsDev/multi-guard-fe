import React from 'react';
import { AlertWithIcon, Button } from '@/components/ui';
import { useNetworkValidation } from '@/hooks/useNetworkValidation';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface NetworkAlertProps {
  className?: string;
}

export const NetworkAlert: React.FC<NetworkAlertProps> = ({ className }) => {
  const {
    isValidNetwork,
    currentNetworkName,
    requiredNetworkName,
    isLoading,
    error,
    switchToSepolia,
    clearError,
  } = useNetworkValidation();

  // Don't show anything if on correct network
  if (isValidNetwork) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    clearError();
    await switchToSepolia();
  };

  return (
    <div className={className}>
      <AlertWithIcon
        variant="warning"
        title="Wrong Network Detected"
        className="mb-4"
      >
        <div className="space-y-3">
          <p className="text-sm">
            You're currently connected to <strong>{currentNetworkName}</strong>, but this application 
            requires <strong>{requiredNetworkName}</strong> to function properly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSwitchNetwork}
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Switch to {requiredNetworkName}
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Network Switch Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Please try switching networks manually in your wallet, or contact support if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AlertWithIcon>

      {/* Success state for when network is correct */}
      {isValidNetwork && (
        <AlertWithIcon
          variant="success"
          title="Network Connected"
          className="mb-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm">
              Successfully connected to {requiredNetworkName}
            </span>
          </div>
        </AlertWithIcon>
      )}
    </div>
  );
};

export default NetworkAlert;
