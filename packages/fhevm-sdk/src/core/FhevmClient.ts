import { ethers } from 'ethers';
import type { FhevmConfig, KeyPair, EncryptedValue, DecryptionRequest, DecryptionResult } from '../types';
import { generateKeypair, getPublicKey } from './keys';
import { encryptInput } from './encryption';
import { decryptData } from './decryption';

/**
 * Main FHEVM Client class
 * Provides a unified interface for FHEVM operations
 */
export class FhevmClient {
  private provider: ethers.Provider;
  private contractAddress?: string;
  private chainId?: number;
  private gatewayUrl?: string;
  private keyPair?: KeyPair;
  private publicKey?: string;

  constructor(config: FhevmConfig) {
    // Initialize provider
    if (typeof config.provider === 'string') {
      this.provider = new ethers.JsonRpcProvider(config.provider);
    } else {
      this.provider = config.provider;
    }

    this.contractAddress = config.contractAddress;
    this.chainId = config.chainId;
    this.gatewayUrl = config.gatewayUrl || 'https://gateway.zama.ai';
  }

  /**
   * Initialize the client with network information
   */
  async init(): Promise<void> {
    // Get network information
    const network = await this.provider.getNetwork();
    if (!this.chainId) {
      this.chainId = Number(network.chainId);
    }

    // Generate keypair for encryption/decryption
    this.keyPair = await generateKeypair();
    this.publicKey = await getPublicKey(this.contractAddress || '');
  }

  /**
   * Encrypt a value for on-chain use
   */
  async encrypt(value: number | bigint, type: 'uint8' | 'uint16' | 'uint32' | 'uint64' = 'uint32'): Promise<EncryptedValue> {
    if (!this.publicKey) {
      throw new Error('Client not initialized. Call init() first.');
    }

    return encryptInput(value, type, this.publicKey);
  }

  /**
   * Decrypt a value from the blockchain
   */
  async decrypt(request: DecryptionRequest): Promise<DecryptionResult> {
    if (!this.keyPair) {
      throw new Error('Client not initialized. Call init() first.');
    }

    return decryptData(request, this.keyPair.privateKey, this.gatewayUrl);
  }

  /**
   * Get the provider instance
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }

  /**
   * Get the contract address
   */
  getContractAddress(): string | undefined {
    return this.contractAddress;
  }

  /**
   * Set the contract address
   */
  setContractAddress(address: string): void {
    this.contractAddress = address;
  }

  /**
   * Get the chain ID
   */
  getChainId(): number | undefined {
    return this.chainId;
  }

  /**
   * Get the public key for encryption
   */
  getPublicKey(): string | undefined {
    return this.publicKey;
  }

  /**
   * Create a contract instance
   */
  createContract(address: string, abi: any): ethers.Contract {
    return new ethers.Contract(address, abi, this.provider);
  }

  /**
   * Connect to a signer for transaction signing
   */
  async connectSigner(signer: ethers.Signer): Promise<FhevmClient> {
    const newProvider = signer.provider;
    if (!newProvider) {
      throw new Error('Signer must have a provider');
    }

    const newConfig: FhevmConfig = {
      provider: newProvider,
      contractAddress: this.contractAddress,
      chainId: this.chainId,
      gatewayUrl: this.gatewayUrl
    };

    const newClient = new FhevmClient(newConfig);
    await newClient.init();
    return newClient;
  }
}
