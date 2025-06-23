export * from './contracts';

export interface User {
  address: string;
  isConnected: boolean;
}

export interface AppState {
  user: User | null;
  selectedWallet: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  error: string | null;
  code?: string;
}
