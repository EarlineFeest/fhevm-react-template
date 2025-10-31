'use client';

import { FhevmProvider } from '@fhevm/sdk/react';
import EncryptionDemo from '@/components/EncryptionDemo';
import DecryptionDemo from '@/components/DecryptionDemo';
import ContractInteraction from '@/components/ContractInteraction';

export default function Home() {
  const fhevmConfig = {
    provider: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
  };

  return (
    <FhevmProvider config={fhevmConfig}>
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">FHEVM SDK Demo</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Privacy-preserving computations with Fully Homomorphic Encryption
            </p>
          </header>

          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Encryption Demo</h2>
              <EncryptionDemo />
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Decryption Demo</h2>
              <DecryptionDemo />
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Contract Interaction</h2>
              <ContractInteraction />
            </section>
          </div>

          <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
            <p>Built with FHEVM SDK | Framework-agnostic encryption for EVM</p>
          </footer>
        </div>
      </main>
    </FhevmProvider>
  );
}
