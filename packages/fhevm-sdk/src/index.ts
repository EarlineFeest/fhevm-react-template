/**
 * FHEVM SDK - Universal SDK for Fully Homomorphic Encryption on EVM
 *
 * This SDK provides a framework-agnostic interface for working with
 * encrypted data on blockchain using Zama's FHEVM technology.
 */

export { FhevmClient } from './core/FhevmClient';
export { createFhevmInstance } from './core/instance';
export { encryptInput, encryptUint8, encryptUint16, encryptUint32, encryptUint64 } from './core/encryption';
export { decryptData, createDecryptionRequest } from './core/decryption';
export { getPublicKey, generateKeypair } from './core/keys';
export { createEIP712Signature } from './utils/eip712';
export { parseEncryptedValue } from './utils/parser';

// Types
export type {
  FhevmConfig,
  EncryptedValue,
  DecryptionRequest,
  DecryptionResult,
  KeyPair,
  EIP712Domain,
  EIP712Message
} from './types';
