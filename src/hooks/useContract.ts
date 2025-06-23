import { useMemo } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { MultiSigWalletABI, WalletFactoryABI, CONTRACT_ADDRESSES } from '@/contracts';

export const useContract = (
  address: string,
  abi: any[],
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
) => {
  return useMemo(() => {
    if (!address || !abi || !provider) return null;
    
    try {
      return new Contract(address, abi, signer || provider);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [address, abi, provider, signer]);
};

export const useMultiSigWallet = (
  walletAddress: string,
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
) => {
  return useContract(walletAddress, MultiSigWalletABI, provider, signer);
};

export const useWalletFactory = (
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
) => {
  return useContract(CONTRACT_ADDRESSES.WALLET_FACTORY, WalletFactoryABI, provider, signer);
};
