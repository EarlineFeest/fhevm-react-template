import type { EncryptedValue } from '../types';

/**
 * Parse an encrypted value from hex string
 */
export function parseEncryptedValue(data: string): EncryptedValue {
  if (!data.startsWith('0x')) {
    throw new Error('Invalid encrypted value format: must start with 0x');
  }

  // Extract metadata from encrypted data structure
  const publicKeyHash = data.slice(2, 10);
  const encryptedData = data.slice(10);

  return {
    data,
    type: 'uint32', // Default type, should be determined from context
    metadata: {
      publicKeyHash,
      length: encryptedData.length
    }
  };
}

/**
 * Parse decrypted value based on type
 */
export function parseDecryptedValue(value: string, type: string): number | bigint | boolean | string {
  switch (type) {
    case 'uint8':
    case 'uint16':
    case 'uint32':
      return parseInt(value, 10);

    case 'uint64':
      return BigInt(value);

    case 'bool':
      return value === '1' || value.toLowerCase() === 'true';

    case 'address':
      return value;

    default:
      return value;
  }
}

/**
 * Format value for display
 */
export function formatValue(value: number | bigint | boolean | string, type: string): string {
  switch (type) {
    case 'bool':
      return value ? 'true' : 'false';

    case 'uint64':
      return value.toString();

    case 'address':
      return value.toString();

    default:
      return value.toString();
  }
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }

  return bytes;
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
