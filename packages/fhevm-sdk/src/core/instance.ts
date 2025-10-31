import { FhevmClient } from './FhevmClient';
import type { FhevmConfig } from '../types';

/**
 * Create and initialize an FHEVM client instance
 *
 * @example
 * ```typescript
 * const client = await createFhevmInstance({
 *   provider: 'http://localhost:8545',
 *   contractAddress: '0x...',
 *   chainId: 31337
 * });
 * ```
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmClient> {
  const client = new FhevmClient(config);
  await client.init();
  return client;
}
