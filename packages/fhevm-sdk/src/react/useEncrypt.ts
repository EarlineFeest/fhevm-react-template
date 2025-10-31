import { useState, useCallback } from 'react';
import { useFhevm } from './FhevmProvider';
import type { EncryptedValue } from '../types';

/**
 * Hook for encrypting values
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { encrypt, isEncrypting, error } = useEncrypt();
 *
 *   const handleEncrypt = async () => {
 *     const encrypted = await encrypt(42, 'uint32');
 *     console.log('Encrypted:', encrypted);
 *   };
 * }
 * ```
 */
export function useEncrypt() {
  const { client, isInitialized } = useFhevm();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      value: number | bigint,
      type: 'uint8' | 'uint16' | 'uint32' | 'uint64' = 'uint32'
    ): Promise<EncryptedValue | null> => {
      if (!client || !isInitialized) {
        setError(new Error('FHEVM client not initialized'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await client.encrypt(value, type);
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isInitialized]
  );

  const encryptUint8 = useCallback(
    async (value: number): Promise<EncryptedValue | null> => {
      return encrypt(value, 'uint8');
    },
    [encrypt]
  );

  const encryptUint16 = useCallback(
    async (value: number): Promise<EncryptedValue | null> => {
      return encrypt(value, 'uint16');
    },
    [encrypt]
  );

  const encryptUint32 = useCallback(
    async (value: number): Promise<EncryptedValue | null> => {
      return encrypt(value, 'uint32');
    },
    [encrypt]
  );

  const encryptUint64 = useCallback(
    async (value: bigint | number): Promise<EncryptedValue | null> => {
      return encrypt(value, 'uint64');
    },
    [encrypt]
  );

  return {
    encrypt,
    encryptUint8,
    encryptUint16,
    encryptUint32,
    encryptUint64,
    isEncrypting,
    error
  };
}
