export { MultiSigWalletABI } from './abis/MultiSigWallet';
export { WalletFactoryABI } from './abis/WalletFactory';

// Contract addresses - these should be set via environment variables
export const CONTRACT_ADDRESSES = {
  WALLET_FACTORY: import.meta.env.VITE_WALLET_FACTORY_ADDRESS || '',
} as const;

// Network configuration
export const SUPPORTED_NETWORKS = {
  ETHEREUM: 1,
  SEPOLIA: 11155111,
  POLYGON: 137,
  MUMBAI: 80001,
} as const;

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.SEPOLIA;
