import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FhevmClient } from '../core/FhevmClient';
import type { FhevmConfig } from '../types';

/**
 * FHEVM Context Type
 */
export interface FhevmContextType {
  client: FhevmClient | null;
  isInitialized: boolean;
  error: Error | null;
}

const FhevmContext = createContext<FhevmContextType | undefined>(undefined);

/**
 * FHEVM Provider Props
 */
interface FhevmProviderProps {
  config: FhevmConfig;
  children: ReactNode;
}

/**
 * FHEVM Provider Component
 *
 * Provides FHEVM client to all child components
 *
 * @example
 * ```tsx
 * <FhevmProvider config={{ provider: 'http://localhost:8545' }}>
 *   <App />
 * </FhevmProvider>
 * ```
 */
export function FhevmProvider({ config, children }: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initClient() {
      try {
        const fhevmClient = new FhevmClient(config);
        await fhevmClient.init();

        if (mounted) {
          setClient(fhevmClient);
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM client'));
          setIsInitialized(false);
        }
      }
    }

    initClient();

    return () => {
      mounted = false;
    };
  }, [config]);

  const value: FhevmContextType = {
    client,
    isInitialized,
    error
  };

  return (
    <FhevmContext.Provider value={value}>
      {children}
    </FhevmContext.Provider>
  );
}

/**
 * Hook to use FHEVM client
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isInitialized } = useFhevm();
 *
 *   if (!isInitialized) return <div>Loading...</div>;
 *
 *   // Use client...
 * }
 * ```
 */
export function useFhevm(): FhevmContextType {
  const context = useContext(FhevmContext);

  if (context === undefined) {
    throw new Error('useFhevm must be used within a FhevmProvider');
  }

  return context;
}
