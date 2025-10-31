/**
 * React hooks and components for FHEVM
 */

export { FhevmProvider, useFhevm } from './FhevmProvider';
export { useEncrypt } from './useEncrypt';
export { useDecrypt } from './useDecrypt';
export { useContract } from './useContract';

// Re-export types
export type { FhevmContextType } from './FhevmProvider';
