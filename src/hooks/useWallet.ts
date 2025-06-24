import { useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import { appKit } from '@/utils/web3';
import { queryKeys } from '@/utils/queryClient';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useWallet = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const queryClient = useQueryClient();

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  const updateWalletState = async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

      const walletProvider = appKit.getWalletProvider();
      if (!walletProvider) {
        setWalletState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          provider: null,
          signer: null,
          chainId: null,
          isLoading: false,
        }));
        return;
      }

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const network = await provider.getNetwork();

      setWalletState({
        isConnected: true,
        address: signerAddress,
        provider,
        signer,
        chainId: Number(network.chainId),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const connect = async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

      // Try React hook approach first
      if (open && typeof open === 'function') {
        try {
          open({ view: 'Connect' });
        } catch (hookError) {
          await appKit.open();
        }
      } else {
        await appKit.open();
      }

      // Reset loading state after a short delay to allow modal to appear
      setTimeout(() => {
        setWalletState(prev => ({ ...prev, isLoading: false }));
      }, 1000);

    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  const disconnect = async () => {
    try {
      await appKit.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Silently handle disconnect errors
    }
  };

  useEffect(() => {
    // Listen for wallet events
    const unsubscribe = appKit.subscribeState((state) => {
      if (state.open === false) {
        updateWalletState();
      }
    });

    // Initial wallet state check
    updateWalletState();

    return () => {
      unsubscribe();
    };
  }, []);

  // Update wallet state when AppKit account changes
  useEffect(() => {
    if (isConnected && address) {
      updateWalletState().then(() => {
        // Invalidate user wallets query when wallet connects
        queryClient.invalidateQueries({
          queryKey: queryKeys.userWallets(address)
        });
      });
    } else {
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
      }));
      // Clear all queries when wallet disconnects
      queryClient.clear();
    }
  }, [isConnected, address, queryClient]);

  return {
    // Use AppKit values for consistency with components
    isConnected: isConnected && walletState.isConnected,
    address: address || walletState.address,
    // Use internal wallet state for provider/signer
    provider: walletState.provider,
    signer: walletState.signer,
    chainId: walletState.chainId,
    isLoading: walletState.isLoading,
    error: walletState.error,
    // Methods
    connect,
    disconnect,
    updateWalletState,
  };
};
