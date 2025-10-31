import type { EIP712Domain, EIP712Message } from '../types';

/**
 * Create an EIP-712 signature for FHEVM operations
 */
export async function createEIP712Signature(
  signer: any,
  domain: EIP712Domain,
  message: Record<string, any>,
  types: Record<string, Array<{ name: string; type: string }>>
): Promise<string> {
  try {
    const signature = await signer._signTypedData(domain, types, message);
    return signature;
  } catch (error) {
    throw new Error(`Failed to create EIP-712 signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create EIP-712 domain for FHEVM
 */
export function createEIP712Domain(
  contractAddress: string,
  chainId: number,
  name: string = 'FHEVM',
  version: string = '1'
): EIP712Domain {
  return {
    name,
    version,
    chainId,
    verifyingContract: contractAddress
  };
}

/**
 * Create EIP-712 message structure for decryption
 */
export function createDecryptionMessage(
  handle: string,
  userAddress: string
): EIP712Message {
  const domain: EIP712Domain = {
    name: 'FHEVM',
    version: '1',
    chainId: 0, // Will be set by caller
    verifyingContract: '' // Will be set by caller
  };

  const types = {
    DecryptionRequest: [
      { name: 'handle', type: 'bytes32' },
      { name: 'user', type: 'address' }
    ]
  };

  const message = {
    handle,
    user: userAddress
  };

  return {
    domain,
    types,
    primaryType: 'DecryptionRequest',
    message
  };
}

/**
 * Verify EIP-712 signature
 */
export function verifyEIP712Signature(
  signature: string,
  message: EIP712Message,
  expectedSigner: string
): boolean {
  // In production, implement proper signature verification
  // This is a simplified mock
  return signature.length > 0 && expectedSigner.length > 0;
}
