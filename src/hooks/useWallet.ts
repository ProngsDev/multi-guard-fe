import { useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
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
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      await appKit.open();
    } catch (error) {
      console.error('Error connecting wallet:', error);
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

  return {
    ...walletState,
    connect,
    disconnect,
    updateWalletState,
  };
};
