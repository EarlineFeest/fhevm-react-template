import type { EncryptedValue, EncryptionInput } from '../types';

/**
 * Encrypt a uint8 value
 */
export function encryptUint8(value: number, publicKey: string): EncryptedValue {
  return encryptValue(value, 'uint8', publicKey);
}

/**
 * Encrypt a uint16 value
 */
export function encryptUint16(value: number, publicKey: string): EncryptedValue {
  return encryptValue(value, 'uint16', publicKey);
}

/**
 * Encrypt a uint32 value
 */
export function encryptUint32(value: number, publicKey: string): EncryptedValue {
  return encryptValue(value, 'uint32', publicKey);
}

/**
 * Encrypt a uint64 value
 */
export function encryptUint64(value: bigint | number, publicKey: string): EncryptedValue {
  return encryptValue(value, 'uint64', publicKey);
}

/**
 * Generic encryption function
 */
export function encryptInput(
  value: number | bigint | string,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'address' | 'bool',
  publicKey: string
): EncryptedValue {
  return encryptValue(value, type, publicKey);
}

/**
 * Core encryption logic
 *
 * Note: This is a simplified implementation.
 * In production, this should use Zama's TFHE library for actual encryption.
 */
function encryptValue(
  value: number | bigint | string,
  type: string,
  publicKey: string
): EncryptedValue {
  // Validate input based on type
  validateInput(value, type);

  // Convert value to bytes
  const valueBytes = valueToBytes(value, type);

  // In production, use TFHE encryption here
  // For now, we create a mock encrypted structure
  const encryptedData = mockEncrypt(valueBytes, publicKey);

  return {
    data: encryptedData,
    type,
    metadata: {
      publicKey,
      timestamp: Date.now()
    }
  };
}

/**
 * Validate input based on type constraints
 */
function validateInput(value: number | bigint | string, type: string): void {
  const numValue = typeof value === 'string' ? BigInt(value) : BigInt(value);

  switch (type) {
    case 'uint8':
      if (numValue < 0n || numValue > 255n) {
        throw new Error(`Value ${value} out of range for uint8 (0-255)`);
      }
      break;
    case 'uint16':
      if (numValue < 0n || numValue > 65535n) {
        throw new Error(`Value ${value} out of range for uint16 (0-65535)`);
      }
      break;
    case 'uint32':
      if (numValue < 0n || numValue > 4294967295n) {
        throw new Error(`Value ${value} out of range for uint32 (0-4294967295)`);
      }
      break;
    case 'uint64':
      if (numValue < 0n || numValue > 18446744073709551615n) {
        throw new Error(`Value ${value} out of range for uint64`);
      }
      break;
    case 'bool':
      if (numValue !== 0n && numValue !== 1n) {
        throw new Error(`Value ${value} must be 0 or 1 for bool`);
      }
      break;
  }
}

/**
 * Convert value to bytes based on type
 */
function valueToBytes(value: number | bigint | string, type: string): Uint8Array {
  const numValue = typeof value === 'string' ? BigInt(value) : BigInt(value);

  let byteLength: number;
  switch (type) {
    case 'uint8':
      byteLength = 1;
      break;
    case 'uint16':
      byteLength = 2;
      break;
    case 'uint32':
      byteLength = 4;
      break;
    case 'uint64':
      byteLength = 8;
      break;
    case 'bool':
      byteLength = 1;
      break;
    default:
      byteLength = 32; // default for address
  }

  const bytes = new Uint8Array(byteLength);
  let tempValue = numValue;

  for (let i = byteLength - 1; i >= 0; i--) {
    bytes[i] = Number(tempValue & 0xFFn);
    tempValue >>= 8n;
  }

  return bytes;
}

/**
 * Mock encryption function
 * In production, replace with actual TFHE encryption
 */
function mockEncrypt(data: Uint8Array, publicKey: string): string {
  // Create a simple encrypted format
  // Format: 0x + publicKeyHash(8 chars) + encryptedData(hex)
  const publicKeyHash = publicKey.slice(2, 10);
  const dataHex = Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Add some padding to simulate encrypted data expansion
  const padding = '0'.repeat(64);

  return `0x${publicKeyHash}${dataHex}${padding}`;
}
