import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { useMultiSigWallet, useWalletFactory } from './useContract';
import { formatEther, parseEther, parseContractError, retryContractCall } from '@/utils/web3';
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
    const message = parseContractError(error) || defaultMessage;
    setError(message);
    return null;
  }, []);

  // Helper function to fetch all owners from the contract
  const fetchOwners = useCallback(async (contract: Contract): Promise<string[]> => {
    const owners: string[] = [];
    let index = 0;

    try {
      // Fetch owners until we hit an error (indicating end of array)
      while (index < 10) { // Max 10 owners as per contract limit
        const owner = await contract.owners(index);
        if (owner && owner !== '0x0000000000000000000000000000000000000000') {
          owners.push(owner);
          index++;
        } else {
          break;
        }
      }
    } catch {
      // Expected when we reach the end of the owners array
    }

    return owners;
  }, []);

  const getWalletInfo = useCallback(async (): Promise<WalletInfo | null> => {
    if (!multiSigContract || !provider || !walletAddress) return null;

    try {
      setIsLoading(true);
      setError(null);

      const [owners, threshold, balance, isOwner] = await Promise.all([
        fetchOwners(multiSigContract),
        multiSigContract.threshold(),
        provider.getBalance(walletAddress),
        userAddress ? multiSigContract.isOwner(userAddress) : false,
      ]);

      return {
        address: walletAddress,
        owners,
        threshold: Number(threshold),
        balance: formatEther(balance),
        isOwner: Boolean(isOwner),
      };
    } catch (error) {
      return handleError(error, 'Failed to fetch wallet info');
    } finally {
      setIsLoading(false);
    }
  }, [multiSigContract, provider, walletAddress, userAddress, handleError, fetchOwners]);

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

      const result = await retryContractCall(async () => {
        const tx = await factoryContract.createWallet(params.owners, params.threshold);
        const receipt = await tx.wait();

        // Extract wallet address from events using proper event parsing
        const walletCreatedEvent = receipt.logs
          .map(log => {
            try {
              return factoryContract.interface.parseLog({
                topics: log.topics,
                data: log.data
              });
            } catch {
              return null;
            }
          })
          .find(event => event?.name === 'WalletCreated');

        if (walletCreatedEvent) {
          return walletCreatedEvent.args.wallet;
        }

        throw new Error('WalletCreated event not found in transaction receipt');
      });

      return result;
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

      await retryContractCall(async () => {
        const value = parseEther(params.value);
        const tx = await multiSigContract.submitTransaction(params.to, value, params.data || '0x');
        await tx.wait();
      });

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
    if (!factoryContract || !userAddress || !provider) {
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      // First, verify the contract is deployed
      const contractCode = await provider.getCode(factoryContract.target as string);
      if (contractCode === '0x') {
        throw new Error(`WalletFactory contract not deployed at ${factoryContract.target}`);
      }

      // Get wallets created by the user
      const createdWalletsResult = await factoryContract.getWalletsByCreator(userAddress);

      // Convert the result to a proper array (handle Proxy objects)
      const createdWallets = Array.isArray(createdWalletsResult)
        ? createdWalletsResult
        : Array.from(createdWalletsResult || []);

      // Get wallets where user is an owner (new functionality)
      const ownedWallets: string[] = [];

      try {
        // Query WalletCreated events to find wallets where user is an owner
        const filter = factoryContract.filters.WalletCreated();
        const events = await factoryContract.queryFilter(filter, 0, 'latest');

        for (const event of events) {
          const parsedEvent = factoryContract.interface.parseLog({
            topics: event.topics,
            data: event.data
          });

          if (parsedEvent && parsedEvent.name === 'WalletCreated') {
            const { wallet, owners } = parsedEvent.args;

            // Check if current user is in the owners array (case-insensitive)
            const userIsOwner = owners.some((owner: string) =>
              owner.toLowerCase() === userAddress.toLowerCase()
            );

            if (userIsOwner) {
              ownedWallets.push(wallet);
            }
          }
        }
      } catch (eventError) {
        // Continue with just created wallets if event querying fails
      }

      // Combine and deduplicate wallets
      const allWallets = [...new Set([...createdWallets, ...ownedWallets])];

      return allWallets;
    } catch (error) {
      handleError(error, 'Failed to fetch user wallets');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryContract, userAddress, provider, handleError]);

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
