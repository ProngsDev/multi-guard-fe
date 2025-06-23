import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { useMultiSigWallet, useWalletFactory } from './useContract';
import { formatEther, parseEther } from '@/utils/web3';
import type { 
  WalletInfo, 
  PendingTransaction, 
  CreateWalletParams, 
  SubmitTransactionParams 
} from '@/types';

export const useMultiSigOperations = (walletAddress?: string) => {
  const { provider, signer, address: userAddress } = useWallet();
  const multiSigContract = useMultiSigWallet(walletAddress || '', provider, signer);
  const factoryContract = useWalletFactory(provider, signer);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(error);
    const message = error?.reason || error?.message || defaultMessage;
    setError(message);
    return null;
  }, []);

  const getWalletInfo = useCallback(async (): Promise<WalletInfo | null> => {
    if (!multiSigContract || !provider || !walletAddress) return null;

    try {
      setIsLoading(true);
      setError(null);

      const [owners, threshold, balance, isOwner] = await Promise.all([
        multiSigContract.owners ? 
          Promise.all(Array.from({ length: 10 }, (_, i) => 
            multiSigContract.owners(i).catch(() => null)
          )).then(results => results.filter(Boolean)) :
          [],
        multiSigContract.threshold(),
        provider.getBalance(walletAddress),
        userAddress ? multiSigContract.isOwner(userAddress) : false,
      ]);

      return {
        address: walletAddress,
        owners: owners as string[],
        threshold: Number(threshold),
        balance: formatEther(balance),
        isOwner: Boolean(isOwner),
      };
    } catch (error) {
      return handleError(error, 'Failed to fetch wallet info');
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, provider, walletAddress, userAddress, handleError]);

  const getPendingTransactions = useCallback(async (): Promise<PendingTransaction[]> => {
    if (!multiSigContract || !userAddress) return [];

    try {
      setIsLoading(true);
      setError(null);

      // Get transaction count by trying to access transactions until we get an error
      const transactions: PendingTransaction[] = [];
      let index = 0;
      
      while (true) {
        try {
          const tx = await multiSigContract.transactions(index);
          const [isConfirmed, threshold] = await Promise.all([
            multiSigContract.confirmations(index, userAddress),
            multiSigContract.threshold(),
          ]);

          transactions.push({
            index,
            to: tx.to,
            value: formatEther(tx.value),
            data: tx.data,
            executed: tx.executed,
            confirmations: Number(tx.numConfirmations),
            threshold: Number(threshold),
            isConfirmedByUser: isConfirmed,
            canExecute: Number(tx.numConfirmations) >= Number(threshold) && !tx.executed,
          });
          
          index++;
        } catch {
          break;
        }
      }

      return transactions;
    } catch (error) {
      handleError(error, 'Failed to fetch pending transactions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, userAddress, handleError]);

  const createWallet = useCallback(async (params: CreateWalletParams): Promise<string | null> => {
    if (!factoryContract) return null;

    try {
      setIsLoading(true);
      setError(null);

      const tx = await factoryContract.createWallet(params.owners, params.threshold);
      const receipt = await tx.wait();
      
      // Extract wallet address from events
      const walletCreatedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === factoryContract.interface.getEvent('WalletCreated').topicHash
      );
      
      if (walletCreatedEvent) {
        const decoded = factoryContract.interface.parseLog(walletCreatedEvent);
        return decoded.args.wallet;
      }
      
      return null;
    } catch (error) {
      return handleError(error, 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  }, [factoryContract, handleError]);

  const submitTransaction = useCallback(async (params: SubmitTransactionParams): Promise<boolean> => {
    if (!multiSigContract) return false;

    try {
      setIsLoading(true);
      setError(null);

      const value = parseEther(params.value);
      const tx = await multiSigContract.submitTransaction(params.to, value, params.data || '0x');
      await tx.wait();
      
      return true;
    } catch (error) {
      handleError(error, 'Failed to submit transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, handleError]);

  const confirmTransaction = useCallback(async (txIndex: number): Promise<boolean> => {
    if (!multiSigContract) return false;

    try {
      setIsLoading(true);
      setError(null);

      const tx = await multiSigContract.confirmTransaction(txIndex);
      await tx.wait();
      
      return true;
    } catch (error) {
      handleError(error, 'Failed to confirm transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, handleError]);

  const executeTransaction = useCallback(async (txIndex: number): Promise<boolean> => {
    if (!multiSigContract) return false;

    try {
      setIsLoading(true);
      setError(null);

      const tx = await multiSigContract.executeTransaction(txIndex);
      await tx.wait();
      
      return true;
    } catch (error) {
      handleError(error, 'Failed to execute transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, handleError]);

  const getUserWallets = useCallback(async (): Promise<string[]> => {
    if (!factoryContract || !userAddress) return [];

    try {
      setIsLoading(true);
      setError(null);

      const wallets = await factoryContract.getWalletsByCreator(userAddress);
      return wallets;
    } catch (error) {
      handleError(error, 'Failed to fetch user wallets');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryContract, userAddress, handleError]);

  return {
    isLoading,
    error,
    getWalletInfo,
    getPendingTransactions,
    createWallet,
    submitTransaction,
    confirmTransaction,
    executeTransaction,
    getUserWallets,
    clearError: () => setError(null),
  };
};
