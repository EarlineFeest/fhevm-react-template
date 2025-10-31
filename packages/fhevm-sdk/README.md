# FHEVM SDK

Universal SDK for building privacy-preserving applications with Fully Homomorphic Encryption on EVM-compatible blockchains.

## Features

- **Framework Agnostic**: Works with Node.js, Next.js, React, Vue, or any frontend framework
- **Unified Interface**: Consistent API across all platforms
- **Wagmi-like Structure**: Familiar patterns for web3 developers
- **Type-Safe**: Full TypeScript support
- **React Hooks**: Pre-built hooks for React applications
- **Easy Setup**: Less than 10 lines of code to get started

## Installation

```bash
npm install @fhevm/sdk ethers
```

## Quick Start

### Vanilla JavaScript/Node.js

```typescript
import { createFhevmInstance } from '@fhevm/sdk';

// Initialize client (< 10 lines!)
const client = await createFhevmInstance({
  provider: 'http://localhost:8545',
  contractAddress: '0x...',
  chainId: 31337
});

// Encrypt data
const encrypted = await client.encrypt(42, 'uint32');

// Decrypt data
const result = await client.decrypt({
  contractAddress: '0x...',
  handle: '0x...',
  userAddress: '0x...'
});
```

### React

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

// Wrap your app
function App() {
  return (
    <FhevmProvider config={{ provider: 'http://localhost:8545' }}>
      <MyComponent />
    </FhevmProvider>
  );
}

// Use in components
function MyComponent() {
  const { client, isInitialized } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    console.log('Encrypted:', encrypted);
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

## Core API

### FhevmClient

Main client class for FHEVM operations.

```typescript
import { FhevmClient } from '@fhevm/sdk';

const client = new FhevmClient({
  provider: 'http://localhost:8545',
  contractAddress: '0x...',
  chainId: 31337
});

await client.init();
```

### Encryption

```typescript
// Encrypt different types
const uint8 = await client.encrypt(255, 'uint8');
const uint16 = await client.encrypt(65535, 'uint16');
const uint32 = await client.encrypt(4294967295, 'uint32');
const uint64 = await client.encrypt(18446744073709551615n, 'uint64');
```

### Decryption

```typescript
import { createDecryptionRequest } from '@fhevm/sdk';

// User-specific decryption (requires signature)
const request = await createDecryptionRequest(
  contractAddress,
  handle,
  userAddress,
  signer
);

const result = await client.decrypt(request);
console.log('Decrypted value:', result.value);
```

## React Hooks

### useFhevm

Access the FHEVM client instance.

```tsx
const { client, isInitialized, error } = useFhevm();
```

### useEncrypt

Encrypt values with loading states.

```tsx
const { encrypt, isEncrypting, error } = useEncrypt();

const encrypted = await encrypt(42, 'uint32');
```

### useDecrypt

Decrypt values with loading states.

```tsx
const { decrypt, isDecrypting, error } = useDecrypt();

const result = await decrypt({
  contractAddress: '0x...',
  handle: '0x...',
  userAddress: '0x...'
});
```

### useContract

Interact with FHEVM contracts.

```tsx
const { contract, call, send, isLoading } = useContract(address, abi);

// Read
const value = await call('getValue');

// Write
const tx = await send('setValue', encryptedValue);
await tx.wait();
```

## Architecture

```
@fhevm/sdk
├── core/           # Framework-agnostic core
│   ├── FhevmClient
│   ├── encryption
│   ├── decryption
│   └── keys
├── react/          # React-specific hooks
│   ├── FhevmProvider
│   ├── useEncrypt
│   ├── useDecrypt
│   └── useContract
└── utils/          # Utilities
    ├── eip712
    └── parser
```

## Examples

See the `examples/` directory for complete implementations:

- `nextjs-app/` - Next.js application
- `nodejs-app/` - Node.js CLI application
- `academic-review/` - Privacy-preserving peer review system

## License

MIT
