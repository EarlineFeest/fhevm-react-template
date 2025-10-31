# Node.js CLI Example

Simple command-line application demonstrating FHEVM SDK usage in Node.js environment.

## Features

- Framework-agnostic SDK usage
- Encryption of multiple data types
- Decryption examples
- CLI interface for testing

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

```bash
cp .env.example .env
```

## Usage

Run the main example:

```bash
npm start
```

This will demonstrate:
1. Client initialization
2. Encrypting different data types (uint8, uint16, uint32, uint64)
3. Viewing encrypted data structure
4. Mock decryption process

## Example Output

```
=====================================
FHEVM SDK - Node.js Example
=====================================

Initializing FHEVM client...
✓ Client initialized

Example 1: Encrypting different data types
------------------------------------------
uint8    42                   → 0x1a2b3c4d5e6f7890...
uint16   1000                 → 0x9876543210abcdef...
uint32   1000000              → 0xfedcba0987654321...
uint64   9007199254740991     → 0x123456789abcdef0...

Example 2: Detailed encryption result
------------------------------------------
Original value:  12345
Type:            uint32
Encrypted data:  0x...
Data length:     138 characters

Example 3: Client information
------------------------------------------
Provider:        Connected to http://localhost:8545
Chain ID:        31337
Contract:        0x5FbDB2315678afecb367f032d93F642f64180aa3
Public key:      0x1234567890abcdef...

Example 4: Decryption (mock)
------------------------------------------
Decryption status: ✓ Success
Decrypted value:   453
Data type:         uint32

=====================================
Example completed successfully!
=====================================
```

## Integration

Use this as a reference for integrating FHEVM SDK into:
- Backend services
- CLI tools
- Serverless functions
- Testing scripts

## Code Structure

```javascript
import { createFhevmInstance } from '@fhevm/sdk';

// Initialize
const client = await createFhevmInstance({
  provider: 'http://localhost:8545',
  contractAddress: '0x...',
  chainId: 31337
});

// Encrypt
const encrypted = await client.encrypt(42, 'uint32');

// Decrypt
const result = await client.decrypt(request);
```

## License

MIT
