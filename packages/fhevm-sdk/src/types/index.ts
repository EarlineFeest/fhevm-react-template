import { ethers } from 'ethers';

/**
 * Configuration for FHEVM Client
 */
export interface FhevmConfig {
  /** Network provider URL or provider instance */
  provider: string | ethers.Provider;
  /** Contract address for FHEVM operations */
  contractAddress?: string;
  /** Network chain ID */
  chainId?: number;
  /** Gateway URL for encryption/decryption operations */
  gatewayUrl?: string;
}

/**
 * Encrypted value with metadata
 */
export interface EncryptedValue {
  /** Encrypted data as hex string */
  data: string;
  /** Type of encrypted data (uint8, uint16, uint32, uint64, address, etc.) */
  type: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Key pair for encryption/decryption
 */
export interface KeyPair {
  /** Public key */
  publicKey: string;
  /** Private key */
  privateKey: string;
}

/**
 * Decryption request parameters
 */
export interface DecryptionRequest {
  /** Contract address */
  contractAddress: string;
  /** Encrypted value handle */
  handle: string;
  /** User address */
  userAddress: string;
  /** EIP-712 signature */
  signature?: string;
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  /** Decrypted value */
  value: string | number | bigint;
  /** Original type */
  type: string;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * EIP-712 domain for signing
 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

/**
 * EIP-712 message structure
 */
export interface EIP712Message {
  domain: EIP712Domain;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, any>;
}

/**
 * Encryption input parameters
 */
export interface EncryptionInput {
  /** Value to encrypt */
  value: number | bigint | string;
  /** Type of value */
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'address' | 'bool';
}
