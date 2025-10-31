import type { DecryptionRequest, DecryptionResult } from '../types';

/**
 * Create a decryption request with EIP-712 signature
 */
export async function createDecryptionRequest(
  contractAddress: string,
  handle: string,
  userAddress: string,
  signer: any
): Promise<DecryptionRequest> {
  // Create EIP-712 domain
  const domain = {
    name: 'FHEVM',
    version: '1',
    chainId: await signer.getChainId(),
    verifyingContract: contractAddress
  };

  // Create EIP-712 message
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

  // Sign the message
  const signature = await signer._signTypedData(domain, types, message);

  return {
    contractAddress,
    handle,
    userAddress,
    signature
  };
}

/**
 * Decrypt data using private key and gateway
 */
export async function decryptData(
  request: DecryptionRequest,
  privateKey: string,
  gatewayUrl?: string
): Promise<DecryptionResult> {
  try {
    // In production, this would call the Zama gateway
    // For now, we provide a mock implementation
    const decryptedValue = await mockDecrypt(request, privateKey, gatewayUrl);

    return {
      value: decryptedValue,
      type: 'uint32', // Detected type
      success: true
    };
  } catch (error) {
    return {
      value: 0,
      type: 'unknown',
      success: false,
      error: error instanceof Error ? error.message : 'Decryption failed'
    };
  }
}

/**
 * Public decrypt function (no signature required)
 * Used for publicly accessible encrypted data
 */
export async function publicDecrypt(
  contractAddress: string,
  handle: string,
  gatewayUrl?: string
): Promise<DecryptionResult> {
  try {
    // In production, call the gateway's public decrypt endpoint
    const url = `${gatewayUrl || 'https://gateway.zama.ai'}/public-decrypt`;

    // Mock implementation
    const decryptedValue = mockPublicDecrypt(handle);

    return {
      value: decryptedValue,
      type: 'uint32',
      success: true
    };
  } catch (error) {
    return {
      value: 0,
      type: 'unknown',
      success: false,
      error: error instanceof Error ? error.message : 'Public decryption failed'
    };
  }
}

/**
 * Mock decryption function
 * In production, replace with actual TFHE decryption + gateway call
 */
async function mockDecrypt(
  request: DecryptionRequest,
  privateKey: string,
  gatewayUrl?: string
): Promise<number> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock decryption logic
  // In production, this would:
  // 1. Call the gateway with the signature
  // 2. Gateway verifies the signature
  // 3. Gateway decrypts using the private key
  // 4. Returns decrypted value

  const handleNum = parseInt(request.handle.slice(2, 10), 16);
  return handleNum % 1000; // Return a mock value
}

/**
 * Mock public decryption
 */
function mockPublicDecrypt(handle: string): number {
  const handleNum = parseInt(handle.slice(2, 10), 16);
  return handleNum % 100;
}
