'use client';

import { useState } from 'react';
import { useFhevm, useContract, useEncrypt } from '@fhevm/sdk/react';

// Simple contract ABI for demonstration
const DEMO_ABI = [
  {
    inputs: [{ name: 'value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export default function ContractInteraction() {
  const { isInitialized } = useFhevm();
  const { encrypt } = useEncrypt();
  const [contractAddress, setContractAddress] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [inputValue, setInputValue] = useState('');
  const [readValue, setReadValue] = useState<string | null>(null);

  const { call, send, isLoading } = useContract(contractAddress, DEMO_ABI);

  const handleRead = async () => {
    try {
      const value = await call('getValue');
      setReadValue(value.toString());
    } catch (err) {
      console.error('Read failed:', err);
    }
  };

  const handleWrite = async () => {
    try {
      // Encrypt the value first
      const encrypted = await encrypt(parseInt(inputValue, 10), 'uint32');

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      // Send encrypted value to contract
      const tx = await send('setValue', encrypted.data);
      console.log('Transaction:', tx);
      alert('Transaction sent! Hash: ' + tx.hash);
    } catch (err) {
      console.error('Write failed:', err);
      alert('Transaction failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (!isInitialized) {
    return <div className="text-center py-4">Initializing FHEVM client...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Contract Address</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
          placeholder="0x..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Write Operation</h3>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter value"
          />
          <button
            onClick={handleWrite}
            disabled={isLoading || !inputValue}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Processing...' : 'Set Encrypted Value'}
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Read Operation</h3>
          <button
            onClick={handleRead}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Reading...' : 'Get Value'}
          </button>
          {readValue !== null && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">Value: <span className="font-mono">{readValue}</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Make sure you have a local blockchain running and the contract deployed at the specified address.
        </p>
      </div>
    </div>
  );
}
