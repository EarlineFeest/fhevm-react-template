# FHEVM Next.js Example

This is a Next.js application demonstrating the usage of the FHEVM SDK for building privacy-preserving decentralized applications.

## Features

- Encryption of different data types (uint8, uint16, uint32, uint64)
- Decryption with EIP-712 signatures
- Contract interactions with encrypted data
- React hooks for easy integration
- TypeScript support
- Tailwind CSS styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Local blockchain running (e.g., Hardhat)

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit the values as needed:

```env
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
└── components/
    ├── EncryptionDemo.tsx       # Encryption demo component
    ├── DecryptionDemo.tsx       # Decryption demo component
    └── ContractInteraction.tsx  # Contract interaction demo
```

## Usage Examples

### Using FHEVM Hooks

```tsx
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { client, isInitialized } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  // Encrypt a value
  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    console.log('Encrypted:', encrypted);
  };

  // Decrypt a value
  const handleDecrypt = async () => {
    const result = await decrypt({
      contractAddress: '0x...',
      handle: '0x...',
      userAddress: '0x...'
    });
    console.log('Decrypted:', result);
  };
}
```

### Contract Interaction

```tsx
import { useContract } from '@fhevm/sdk/react';

function ContractDemo() {
  const { call, send, isLoading } = useContract(address, abi);

  // Read from contract
  const getValue = async () => {
    const value = await call('getValue');
    console.log('Value:', value);
  };

  // Write to contract
  const setValue = async (encryptedValue: string) => {
    const tx = await send('setValue', encryptedValue);
    await tx.wait();
  };
}
```

## Building for Production

```bash
npm run build
npm start
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai/fhevm)

## License

MIT
