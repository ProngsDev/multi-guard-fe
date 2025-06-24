import { useState, useEffect, useCallback } from 'react';
import { useAppKitNetwork } from '@reown/appkit/react';
import { sepolia } from '@reown/appkit/networks';
import { SUPPORTED_NETWORKS } from '@/contracts';

interface NetworkValidationState {
  isValidNetwork: boolean;
  currentChainId: number | null;
  requiredChainId: number;
  isLoading: boolean;
  error: string | null;
}

export const useNetworkValidation = () => {
  const { chainId, switchNetwork, caipNetwork } = useAppKitNetwork();
  
  const [state, setState] = useState<NetworkValidationState>({
    isValidNetwork: false,
    currentChainId: null,
    requiredChainId: SUPPORTED_NETWORKS.SEPOLIA,
    isLoading: false,
    error: null,
  });

  // Check if current network is valid (Sepolia)
  const validateNetwork = useCallback(() => {
    const currentChainId = chainId || null;
    const isValid = currentChainId === SUPPORTED_NETWORKS.SEPOLIA;
    
    setState(prev => ({
      ...prev,
      isValidNetwork: isValid,
      currentChainId,
      error: null,
    }));
  }, [chainId]);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    if (!switchNetwork) {
      setState(prev => ({
        ...prev,
        error: 'Network switching is not available',
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await switchNetwork(sepolia);
      
      // Wait a moment for the network change to propagate
      setTimeout(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      }, 1000);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to switch network';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, [switchNetwork]);

  // Get network name for display
  const getNetworkName = useCallback((chainId: number | null): string => {
    if (!chainId) return 'Unknown';
    
    switch (chainId) {
      case SUPPORTED_NETWORKS.ETHEREUM:
        return 'Ethereum Mainnet';
      case SUPPORTED_NETWORKS.SEPOLIA:
        return 'Sepolia Testnet';
      case SUPPORTED_NETWORKS.POLYGON:
        return 'Polygon';
      case SUPPORTED_NETWORKS.MUMBAI:
        return 'Mumbai Testnet';
      default:
        return `Chain ${chainId}`;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Validate network when chainId changes
  useEffect(() => {
    validateNetwork();
  }, [validateNetwork]);

  return {
    // State
    isValidNetwork: state.isValidNetwork,
    currentChainId: state.currentChainId,
    requiredChainId: state.requiredChainId,
    isLoading: state.isLoading,
    error: state.error,
    
    // Network info
    currentNetworkName: getNetworkName(state.currentChainId),
    requiredNetworkName: getNetworkName(state.requiredChainId),
    
    // Actions
    switchToSepolia,
    clearError,
    validateNetwork,
  };
};
