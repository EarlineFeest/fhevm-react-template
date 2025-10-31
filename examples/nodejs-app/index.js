import { createFhevmInstance } from '@fhevm/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Node.js CLI Example - FHEVM SDK
 *
 * Demonstrates basic encryption/decryption in Node.js environment
 */

async function main() {
  console.log('=====================================');
  console.log('FHEVM SDK - Node.js Example');
  console.log('=====================================\n');

  // Initialize FHEVM client
  console.log('Initializing FHEVM client...');

  const client = await createFhevmInstance({
    provider: process.env.RPC_URL || 'http://localhost:8545',
    contractAddress: process.env.CONTRACT_ADDRESS,
    chainId: parseInt(process.env.CHAIN_ID || '31337'),
    gatewayUrl: process.env.FHEVM_GATEWAY_URL
  });

  console.log('✓ Client initialized\n');

  // Example 1: Encrypt different types
  console.log('Example 1: Encrypting different data types');
  console.log('------------------------------------------');

  const values = [
    { value: 42, type: 'uint8' },
    { value: 1000, type: 'uint16' },
    { value: 1000000, type: 'uint32' },
    { value: 9007199254740991n, type: 'uint64' }
  ];

  for (const { value, type } of values) {
    const encrypted = await client.encrypt(value, type);
    console.log(`${type.padEnd(8)} ${value.toString().padEnd(20)} → ${encrypted.data.slice(0, 20)}...`);
  }

  console.log('\n');

  // Example 2: Encryption details
  console.log('Example 2: Detailed encryption result');
  console.log('------------------------------------------');

  const testValue = 12345;
  const encrypted = await client.encrypt(testValue, 'uint32');

  console.log(`Original value:  ${testValue}`);
  console.log(`Type:            ${encrypted.type}`);
  console.log(`Encrypted data:  ${encrypted.data}`);
  console.log(`Data length:     ${encrypted.data.length} characters`);

  if (encrypted.metadata) {
    console.log(`Metadata:        ${JSON.stringify(encrypted.metadata, null, 2)}`);
  }

  console.log('\n');

  // Example 3: Client information
  console.log('Example 3: Client information');
  console.log('------------------------------------------');

  console.log(`Provider:        Connected to ${process.env.RPC_URL || 'http://localhost:8545'}`);
  console.log(`Chain ID:        ${client.getChainId()}`);
  console.log(`Contract:        ${client.getContractAddress() || 'Not set'}`);
  console.log(`Public key:      ${client.getPublicKey()?.slice(0, 20)}...`);

  console.log('\n');

  // Example 4: Mock decryption
  console.log('Example 4: Decryption (mock)');
  console.log('------------------------------------------');

  const decryptionRequest = {
    contractAddress: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    handle: encrypted.data,
    userAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  };

  const decrypted = await client.decrypt(decryptionRequest);

  console.log(`Decryption status: ${decrypted.success ? '✓ Success' : '✗ Failed'}`);
  console.log(`Decrypted value:   ${decrypted.value}`);
  console.log(`Data type:         ${decrypted.type}`);

  console.log('\n=====================================');
  console.log('Example completed successfully!');
  console.log('=====================================\n');
}

// Run the example
main()
  .then(() => {
    console.log('✓ All examples completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
