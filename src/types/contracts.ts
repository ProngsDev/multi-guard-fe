export interface Transaction {
  to: string;
  value: bigint;
  data: string;
  executed: boolean;
  numConfirmations: bigint;
}

export interface MultiSigWallet {
  address: string;
  owners: string[];
  threshold: number;
  balance: bigint;
  transactions: Transaction[];
}

export interface WalletInfo {
  address: string;
  owners: string[];
  threshold: number;
  balance: string;
  isOwner: boolean;
}

export interface PendingTransaction {
  index: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  confirmations: number;
  threshold: number;
  isConfirmedByUser: boolean;
  canExecute: boolean;
}

export interface CreateWalletParams {
  owners: string[];
  threshold: number;
}

export interface SubmitTransactionParams {
  to: string;
  value: string;
  data: string;
}

export interface ContractError {
  name: string;
  message: string;
  code?: string;
}
