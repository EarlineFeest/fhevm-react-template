# Quick Start Guide

Get up and running with FHEVM SDK in under 5 minutes!

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Install all dependencies
npm run install:all

# Build the SDK
npm run build
```

## Run the Examples

### Option 1: Next.js Demo (Recommended)

```bash
# Start the Next.js application
npm run start:nextjs
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js CLI

```bash
# Run the Node.js example
cd examples/nodejs-app
npm start
```

### Option 3: Full Setup with Local Blockchain

**Terminal 1** - Start local blockchain:
```bash
cd examples/academic-review
npm run node
```

**Terminal 2** - Deploy contracts:
```bash
cd examples/academic-review
npm run deploy:local
# Save the contract address!
```

**Terminal 3** - Start Next.js:
```bash
cd examples/nextjs-app
# Update .env.local with contract address
npm run dev
```

## Basic Usage

### Vanilla JavaScript

```javascript
import { createFhevmInstance } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmInstance({
  provider: 'http://localhost:8545',
  contractAddress: '0x...',
  chainId: 31337
});

// Encrypt a value
const encrypted = await client.encrypt(42, 'uint32');
console.log('Encrypted:', encrypted.data);

// Decrypt a value
const result = await client.decrypt({
  contractAddress: '0x...',
  handle: encrypted.data,
  userAddress: '0x...'
});
console.log('Decrypted:', result.value);
```

### React

```jsx
import { FhevmProvider, useEncrypt } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider config={{ provider: 'http://localhost:8545' }}>
      <EncryptButton />
    </FhevmProvider>
  );
}

function EncryptButton() {
  const { encrypt, isEncrypting } = useEncrypt();

  const handleClick = async () => {
    const result = await encrypt(42, 'uint32');
    alert('Encrypted: ' + result.data);
  };

  return (
    <button onClick={handleClick} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
    </button>
  );
}
```

## Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/          # The SDK you'll use
├── examples/
│   ├── nextjs-app/         # Next.js demo
│   ├── nodejs-app/         # Node.js CLI
│   └── academic-review/    # Smart contracts
└── demo.mp4                # Video demo
```

## What's Included

### FHEVM SDK (`packages/fhevm-sdk`)

The universal SDK that works everywhere:

- ✅ Encryption (uint8, uint16, uint32, uint64)
- ✅ Decryption with EIP-712 signatures
- ✅ Contract interactions
- ✅ React hooks
- ✅ TypeScript support

### Next.js Example (`examples/nextjs-app`)

Full-featured demo application:

- ✅ Encryption demo
- ✅ Decryption demo
- ✅ Contract interaction
- ✅ Responsive UI

### Academic Review System (`examples/academic-review`)

Real-world use case:

- ✅ Privacy-preserving peer review
- ✅ Smart contract
- ✅ Deployment scripts

## Next Steps

### 1. Explore the SDK

Check out the SDK documentation:
```bash
cat packages/fhevm-sdk/README.md
```

### 2. Try Different Examples

```bash
# Next.js
npm run start:nextjs

# Node.js
cd examples/nodejs-app && npm start

# Deploy contracts
cd examples/academic-review && npm run deploy:local
```

### 3. Build Your Own App

Use the SDK in your project:

```bash
# Install SDK
npm install @fhevm/sdk ethers

# Import and use
import { createFhevmInstance } from '@fhevm/sdk';
```

### 4. Read the Documentation

- [Main README](./README.md) - Complete overview
- [SDK Documentation](./packages/fhevm-sdk/README.md) - API reference
- [Architecture](./ARCHITECTURE.md) - Design details
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

## Common Tasks

### Encrypt a Value

```javascript
const client = await createFhevmInstance({ /* config */ });
const encrypted = await client.encrypt(42, 'uint32');
```

### Decrypt a Value

```javascript
const result = await client.decrypt({
  contractAddress: '0x...',
  handle: '0x...',
  userAddress: '0x...'
});
```

### Interact with Contract

```javascript
const contract = client.createContract(address, abi);
const value = await contract.getValue();
```

### Use React Hooks

```jsx
import { useFhevm, useEncrypt, useDecrypt, useContract } from '@fhevm/sdk/react';

function MyComponent() {
  const { client, isInitialized } = useFhevm();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const { call, send } = useContract(address, abi);

  // Use the hooks...
}
```

## Troubleshooting

### SDK not building?

```bash
cd packages/fhevm-sdk
npm install
npm run build
```

### Next.js not starting?

```bash
cd examples/nextjs-app
rm -rf .next node_modules
npm install
npm run dev
```

### Contract deployment failing?

```bash
cd examples/academic-review
npm run clean
npm run compile
npm run deploy:local
```

## Get Help

- 📖 Read the [full documentation](./README.md)
- 🐛 Report issues on GitHub
- 💬 Join the community discussions
- 📧 Contact support

## Quick Links

- [Main README](./README.md)
- [SDK Package](./packages/fhevm-sdk/)
- [Next.js Example](./examples/nextjs-app/)
- [Architecture](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

---

**Ready to build privacy-preserving applications?** 🚀

Start with:
```bash
npm run start:nextjs
```

And open [http://localhost:3000](http://localhost:3000)!
