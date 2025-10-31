# FHEVM SDK Architecture

## Overview

The FHEVM SDK is designed with a layered architecture to provide maximum flexibility and reusability across different frameworks and environments.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Framework Adapters              │
│  (React, Vue, Svelte, Angular, etc.)   │
├─────────────────────────────────────────┤
│          Core SDK Layer                 │
│  (Framework-agnostic functionality)     │
├─────────────────────────────────────────┤
│         Utilities Layer                 │
│  (EIP-712, Parsers, Validators)        │
├─────────────────────────────────────────┤
│      External Dependencies              │
│     (ethers.js, TFHE library)          │
└─────────────────────────────────────────┘
```

## Core Components

### 1. FhevmClient

The main client class that provides all FHEVM functionality.

**Responsibilities:**
- Initialize connection to blockchain
- Manage encryption/decryption operations
- Handle key management
- Create contract instances

**Design Patterns:**
- Singleton pattern for client instance
- Factory pattern for instance creation
- Strategy pattern for different encryption types

### 2. Encryption Module

Handles encryption of different data types.

**Components:**
- `encryptInput()` - Generic encryption function
- `encryptUint8/16/32/64()` - Type-specific helpers
- `validateInput()` - Input validation
- `valueToBytes()` - Type conversion

**Flow:**
```
Input Value → Validation → Conversion → Encryption → EncryptedValue
```

### 3. Decryption Module

Manages decryption with signature verification.

**Components:**
- `decryptData()` - User-specific decryption with signature
- `publicDecrypt()` - Public decryption without signature
- `createDecryptionRequest()` - EIP-712 signature creation

**Flow:**
```
Encrypted Handle → Signature → Gateway Request → Decryption → Result
```

### 4. Key Management

Handles public/private key operations.

**Components:**
- `generateKeypair()` - Create encryption keys
- `getPublicKey()` - Fetch public key from contract/gateway
- `derivePublicKey()` - Derive public from private key

### 5. React Hooks Layer

Provides React-specific abstractions.

**Components:**
- `FhevmProvider` - Context provider for client
- `useFhevm` - Access client instance
- `useEncrypt` - Encryption with loading states
- `useDecrypt` - Decryption with loading states
- `useContract` - Contract interaction

**Design:**
- Context API for state management
- Custom hooks for functionality
- TypeScript generics for type safety

## Data Flow

### Encryption Flow

```
User Input
   ↓
useEncrypt Hook (React)
   ↓
FhevmClient.encrypt()
   ↓
Validation
   ↓
Type Conversion
   ↓
Encryption (TFHE)
   ↓
EncryptedValue
   ↓
Return to User
```

### Decryption Flow

```
Encrypted Handle
   ↓
useDecrypt Hook (React)
   ↓
Create EIP-712 Signature
   ↓
FhevmClient.decrypt()
   ↓
Gateway Request
   ↓
Signature Verification
   ↓
Decryption (TFHE)
   ↓
DecryptionResult
   ↓
Return to User
```

### Contract Interaction Flow

```
User Action
   ↓
useContract Hook
   ↓
Encrypt Input (if needed)
   ↓
Create Transaction
   ↓
Sign & Send
   ↓
Wait for Confirmation
   ↓
Return Receipt
```

## Type System

### Core Types

```typescript
// Configuration
interface FhevmConfig {
  provider: string | Provider;
  contractAddress?: string;
  chainId?: number;
  gatewayUrl?: string;
}

// Encrypted Value
interface EncryptedValue {
  data: string;
  type: string;
  metadata?: Record<string, any>;
}

// Decryption Request
interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
  signature?: string;
}

// Decryption Result
interface DecryptionResult {
  value: string | number | bigint;
  type: string;
  success: boolean;
  error?: string;
}
```

## Module Dependencies

```
FhevmClient
├── depends on: ethers.Provider
├── uses: encryption module
├── uses: decryption module
└── uses: key management

React Hooks
├── depends on: React
├── uses: FhevmClient
└── provides: component integration

Utilities
├── EIP-712 signature
├── Value parsers
└── Type validators
```

## Extension Points

### Adding New Framework Support

1. Create adapter directory: `src/[framework]/`
2. Implement provider pattern
3. Create framework-specific hooks/composables
4. Export in main index

Example for Vue:

```typescript
// src/vue/index.ts
export { useFhevm } from './useFhevm';
export { useEncrypt } from './useEncrypt';
```

### Adding New Encryption Types

1. Add type to `EncryptionInput.type` union
2. Implement validation in `validateInput()`
3. Add conversion logic in `valueToBytes()`
4. Export type-specific helper function

### Adding New Utilities

1. Create utility file in `src/utils/`
2. Implement functionality
3. Export in `src/utils/index.ts`
4. Document in README

## Performance Considerations

### Caching

- Public keys are cached per contract address
- Provider instances are reused
- Contract instances are cached

### Lazy Loading

- Framework adapters are separate entry points
- Import only what you need
- Tree-shaking friendly

### Async Operations

- All encryption/decryption is async
- Parallel operations where possible
- Progress indicators via hooks

## Security Considerations

### Key Management

- Private keys never leave the client
- Public keys verified from contract
- Secure random generation

### Signature Verification

- EIP-712 typed signatures
- Domain separation per contract
- Nonce/timestamp for replay protection

### Input Validation

- Type checking before encryption
- Range validation per type
- Sanitization of user input

## Testing Strategy

### Unit Tests

- Individual function testing
- Mock external dependencies
- Edge case coverage

### Integration Tests

- End-to-end flows
- Real contract interaction (testnet)
- Multiple scenarios

### E2E Tests

- Example applications
- User workflows
- Cross-browser testing

## Future Enhancements

### Planned Features

1. **Additional Types**: ebool, eaddress support
2. **Batch Operations**: Encrypt/decrypt multiple values
3. **Caching Layer**: Reduce redundant operations
4. **WebSocket Support**: Real-time updates
5. **Mobile SDKs**: React Native, Flutter

### Framework Support Roadmap

- ✅ React (Complete)
- 🔄 Vue (Planned)
- 🔄 Svelte (Planned)
- 🔄 Angular (Planned)
- 🔄 React Native (Planned)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on extending the architecture.
