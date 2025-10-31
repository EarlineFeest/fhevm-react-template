import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFhevm } from './FhevmProvider';

/**
 * Hook for interacting with FHEVM contracts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { contract, call, send, isLoading } = useContract(
 *     '0x...',
 *     contractABI
 *   );
 *
 *   const getValue = async () => {
 *     const value = await call('getValue');
 *     console.log('Value:', value);
 *   };
 * }
 * ```
 */
export function useContract(address: string, abi: any) {
  const { client, isInitialized } = useFhevm();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (client && isInitialized && address && abi) {
      try {
        const contractInstance = client.createContract(address, abi);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create contract instance'));
      }
    }
  }, [client, isInitialized, address, abi]);

  const call = useCallback(
    async (methodName: string, ...args: any[]): Promise<any> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await contract[methodName](...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract call failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const send = useCallback(
    async (methodName: string, ...args: any[]): Promise<ethers.ContractTransactionResponse> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const tx = await contract[methodName](...args);
        return tx;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return {
    contract,
    call,
    send,
    isLoading,
    error
  };
}
