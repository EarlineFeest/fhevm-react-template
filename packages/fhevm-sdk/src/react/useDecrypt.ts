import { useState, useCallback } from 'react';
import { useFhevm } from './FhevmProvider';
import type { DecryptionRequest, DecryptionResult } from '../types';

/**
 * Hook for decrypting values
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { decrypt, isDecrypting, error } = useDecrypt();
 *
 *   const handleDecrypt = async () => {
 *     const result = await decrypt({
 *       contractAddress: '0x...',
 *       handle: '0x...',
 *       userAddress: '0x...'
 *     });
 *     console.log('Decrypted:', result);
 *   };
 * }
 * ```
 */
export function useDecrypt() {
  const { client, isInitialized } = useFhevm();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (request: DecryptionRequest): Promise<DecryptionResult | null> => {
      if (!client || !isInitialized) {
        setError(new Error('FHEVM client not initialized'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await client.decrypt(request);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isInitialized]
  );

  return {
    decrypt,
    isDecrypting,
    error
  };
}
