import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  wallet: (address: string) => ['wallet', address] as const,
  walletInfo: (address: string) => ['walletInfo', address] as const,
  transactions: (address: string) => ['transactions', address] as const,
  userWallets: (userAddress: string) => ['userWallets', userAddress] as const,
  balance: (address: string) => ['balance', address] as const,
} as const;
