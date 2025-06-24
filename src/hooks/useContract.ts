import { useMemo } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { MultiSigWalletABI, WalletFactoryABI, CONTRACT_ADDRESSES } from '@/contracts';
import { validateContractAddress, isValidAddress } from '@/utils/web3';
import type { ContractABI } from '@/types/contracts-abi';

export const useContract = (
  address: string,
  abi: ContractABI,
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
) => {
  return useMemo(() => {
    if (!address || !abi || !provider) return null;

    // Validate address format
    if (!isValidAddress(address)) {
      console.error('Invalid contract address:', address);
      return null;
    }

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
  const validatedAddress = useMemo(() => {
    try {
      validateContractAddress(CONTRACT_ADDRESSES.WALLET_FACTORY, 'WalletFactory');
      return CONTRACT_ADDRESSES.WALLET_FACTORY;
    } catch (error) {
      return '';
    }
  }, []);

  const contract = useContract(validatedAddress, WalletFactoryABI, provider, signer);

  console.log('🏭 WalletFactory contract created:', {
    address: validatedAddress,
    contract: !!contract,
    contractTarget: contract?.target || 'N/A'
  });

  return contract;
};
