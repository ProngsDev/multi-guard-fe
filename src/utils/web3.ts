import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia, polygon, polygonMumbai } from '@reown/appkit/networks'
import { formatEther as ethersFormatEther, parseEther as ethersParseEther } from 'ethers'

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'



// 2. Set the networks
const networks = [mainnet, sepolia, polygon, polygonMumbai]

// 3. Create a metadata object - optional
const metadata = {
  name: 'MultiGuard Wallet',
  description: 'Multi-signature wallet interface',
  url: import.meta.env.DEV ? 'http://localhost:5173' : (import.meta.env.VITE_APP_URL || 'https://multi-guard-fe.vercel.app'), // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 4. Create Ethers adapter
const ethersAdapter = new EthersAdapter()

// 5. Create a AppKit instance
export const appKit = createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  }
})



export { ethersAdapter }

// Utility functions for Web3 operations
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (value: bigint): string => {
  return ethersFormatEther(value);
};

export const parseEther = (value: string): bigint => {
  return ethersParseEther(value);
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateContractAddress = (address: string, contractName: string): void => {
  if (!address) {
    throw new Error(`${contractName} address is not configured. Please set the environment variable.`);
  }
  if (!isValidAddress(address)) {
    throw new Error(`Invalid ${contractName} address: ${address}`);
  }
};

// Enhanced error handling for contract operations
export const parseContractError = (error: any): string => {
  // Handle custom contract errors
  if (error?.reason) {
    return error.reason;
  }

  // Handle revert messages
  if (error?.message) {
    if (error.message.includes('NotOwner')) {
      return 'You are not an owner of this wallet';
    }
    if (error.message.includes('AlreadyConfirmed')) {
      return 'You have already confirmed this transaction';
    }
    if (error.message.includes('AlreadyExecuted')) {
      return 'This transaction has already been executed';
    }
    if (error.message.includes('TxDoesNotExist')) {
      return 'Transaction does not exist';
    }
    if (error.message.includes('InvalidThreshold')) {
      return 'Invalid threshold value';
    }
    if (error.message.includes('InvalidNumberOfOwners')) {
      return 'Invalid number of owners (must be 1-10)';
    }
    if (error.message.includes('ZeroAddress')) {
      return 'Zero address is not allowed';
    }
    if (error.message.includes('NotUnique')) {
      return 'Duplicate owner address detected';
    }
    if (error.message.includes('DuplicateOwner')) {
      return 'Duplicate owner address detected';
    }
    if (error.message.includes('InvalidOwnersLength')) {
      return 'Invalid number of owners';
    }
    if (error.message.includes('WalletDeploymentFailed')) {
      return 'Failed to deploy wallet';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }

    return error.message;
  }

  return 'An unknown error occurred';
};

// Retry mechanism for contract calls
export const retryContractCall = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry user rejections or contract logic errors
      if (error?.message?.includes('user rejected') ||
          error?.message?.includes('NotOwner') ||
          error?.message?.includes('AlreadyConfirmed') ||
          error?.message?.includes('AlreadyExecuted')) {
        throw error;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};
