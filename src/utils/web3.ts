import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia, polygon, polygonMumbai } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Set the networks
const networks = [mainnet, sepolia, polygon, polygonMumbai]

// 3. Create a metadata object - optional
const metadata = {
  name: 'MultiGuard Wallet',
  description: 'Multi-signature wallet interface',
  url: 'https://multiguard.app', // origin must match your domain & subdomain
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
  return (Number(value) / 1e18).toFixed(4);
};

export const parseEther = (value: string): bigint => {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
