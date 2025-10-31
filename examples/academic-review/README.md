# Academic Review System Example

Privacy-preserving peer review system demonstrating FHEVM SDK integration for secure academic paper reviews.

## Overview

This example demonstrates how to integrate the FHEVM SDK into a real-world application for managing academic peer reviews with privacy guarantees.

## Features

- Submit academic papers with encrypted metadata
- Register reviewers with expertise areas
- Submit encrypted reviews with scores
- Privacy-preserving score aggregation
- On-chain evidence of review process

## Smart Contract

The `AcademicReviewSystem.sol` contract provides:

- Paper submission functionality
- Reviewer registration
- Encrypted review submission
- Score reveal mechanisms

## Setup

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Deploy Contracts

Local deployment:

```bash
# Start local node
npm run node

# In another terminal, deploy
npm run deploy:local
```

Sepolia testnet:

```bash
npm run deploy:sepolia
```

## Integration with FHEVM SDK

### Encrypting Review Scores

```javascript
import { createFhevmInstance } from '@fhevm/sdk';

// Initialize SDK
const client = await createFhevmInstance({
  provider: 'http://localhost:8545',
  contractAddress: deployedAddress,
  chainId: 31337
});

// Encrypt review score (1-10)
const encryptedScore = await client.encrypt(8, 'uint8');

// Submit encrypted review
const tx = await contract.submitReview(
  paperId,
  encryptedScore.data,
  inputProof,
  comments
);
```

### Decrypting Results

```javascript
import { createDecryptionRequest } from '@fhevm/sdk';

// Create decryption request with EIP-712 signature
const request = await createDecryptionRequest(
  contractAddress,
  scoreHandle,
  userAddress,
  signer
);

// Decrypt the score
const result = await client.decrypt(request);
console.log('Review score:', result.value);
```

## Testing

```bash
npm test
```

## Contract Architecture

```
AcademicReviewSystem
├── Paper submission
├── Reviewer management
├── Encrypted review submission
└── Score revelation
```

## Use Cases

1. **Blind Peer Review**: Reviewers submit encrypted scores that remain private until reveal
2. **Score Aggregation**: Combine multiple encrypted scores without revealing individual values
3. **Audit Trail**: On-chain evidence of review process while maintaining privacy

## License

MIT
