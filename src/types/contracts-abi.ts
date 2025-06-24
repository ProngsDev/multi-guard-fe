// Type-safe contract interfaces for Multi-Guard contracts

export interface ContractFunction {
  type: 'function';
  name: string;
  inputs: ContractInput[];
  outputs: ContractOutput[];
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
}

export interface ContractEvent {
  type: 'event';
  name: string;
  inputs: ContractEventInput[];
  anonymous: boolean;
}

export interface ContractErrorABI {
  type: 'error';
  name: string;
  inputs: ContractInput[];
}

export interface ContractConstructor {
  type: 'constructor';
  inputs: ContractInput[];
  stateMutability: 'nonpayable' | 'payable';
}

export interface ContractReceive {
  type: 'receive';
  stateMutability: 'payable';
}

export interface ContractInput {
  name: string;
  type: string;
  internalType: string;
}

export interface ContractOutput {
  name: string;
  type: string;
  internalType: string;
}

export interface ContractEventInput extends ContractInput {
  indexed: boolean;
}

export type ContractABIItem =
  | ContractFunction
  | ContractEvent
  | ContractErrorABI
  | ContractConstructor
  | ContractReceive;

export type ContractABI = readonly ContractABIItem[];

// Specific types for Multi-Guard contracts
export type MultiSigWalletABI = ContractABI;
export type WalletFactoryABI = ContractABI;

// Contract method parameter types
export interface MultiSigWalletMethods {
  confirmTransaction: (txIndex: bigint) => Promise<void>;
  executeTransaction: (txIndex: bigint) => Promise<void>;
  submitTransaction: (to: string, value: bigint, data: string) => Promise<void>;
  owners: (index: bigint) => Promise<string>;
  threshold: () => Promise<bigint>;
  isOwner: (address: string) => Promise<boolean>;
  transactions: (index: bigint) => Promise<{
    to: string;
    value: bigint;
    data: string;
    executed: boolean;
    numConfirmations: bigint;
  }>;
  confirmations: (txIndex: bigint, owner: string) => Promise<boolean>;
}

export interface WalletFactoryMethods {
  createWallet: (owners: string[], threshold: bigint) => Promise<string>;
  getWalletsByCreator: (creator: string) => Promise<string[]>;
  getWalletCountByCreator: (creator: string) => Promise<bigint>;
  isWalletFromFactory: (wallet: string) => Promise<boolean>;
  predictWalletAddress: (creator: string, owners: string[], threshold: bigint) => Promise<{
    predictedAddress: string;
    salt: string;
  }>;
  totalWalletsCreated: () => Promise<bigint>;
  MAX_OWNERS: () => Promise<bigint>;
  MIN_OWNERS: () => Promise<bigint>;
}

// Event types
export interface WalletCreatedEvent {
  creator: string;
  wallet: string;
  owners: string[];
  threshold: bigint;
  salt: string;
}

export interface TransactionSubmittedEvent {
  txIndex: bigint;
  to: string;
  value: bigint;
  data: string;
}

export interface TransactionConfirmedEvent {
  txIndex: bigint;
  owner: string;
}

export interface TransactionExecutedEvent {
  txIndex: bigint;
}
