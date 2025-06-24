import { useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { appKit } from '@/utils/web3';

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
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setWalletState({
        isConnected: true,
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error updating wallet state:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const connect = async () => {
    try {
      console.log('🔗 Connect button clicked from useWallet hook');
      console.log('🔗 Open function available:', !!open);
      console.log('🔗 Open function type:', typeof open);

      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

      // Try React hook approach first
      if (open && typeof open === 'function') {
        console.log('🔗 Using React hook approach...');
        try {
          open({ view: 'Connect' });
          console.log('🔗 React hook open() completed successfully');
        } catch (hookError) {
          console.warn('🔗 React hook failed, trying direct AppKit:', hookError);
          await appKit.open();
          console.log('🔗 Direct AppKit open() completed successfully');
        }
      } else {
        console.log('🔗 React hook not available, using direct AppKit...');
        await appKit.open();
        console.log('🔗 Direct AppKit open() completed successfully');
      }

      // Reset loading state after a short delay to allow modal to appear
      setTimeout(() => {
        setWalletState(prev => ({ ...prev, isLoading: false }));
      }, 1000);

    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
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
      console.error('Error disconnecting wallet:', error);
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
      updateWalletState();
    } else {
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
      }));
    }
  }, [isConnected, address]);

  return {
    ...walletState,
    connect,
    disconnect,
    updateWalletState,
  };
};
