'use client';

import { useState } from 'react';
import { useEncrypt, useFhevm } from '@fhevm/sdk/react';

export default function EncryptionDemo() {
  const { isInitialized } = useFhevm();
  const { encrypt, isEncrypting, error } = useEncrypt();
  const [value, setValue] = useState('42');
  const [type, setType] = useState<'uint8' | 'uint16' | 'uint32' | 'uint64'>('uint32');
  const [encryptedResult, setEncryptedResult] = useState<string | null>(null);

  const handleEncrypt = async () => {
    const numValue = type === 'uint64' ? BigInt(value) : parseInt(value, 10);
    const result = await encrypt(numValue, type);

    if (result) {
      setEncryptedResult(result.data);
    }
  };

  if (!isInitialized) {
    return <div className="text-center py-4">Initializing FHEVM client...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Value to Encrypt</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter a number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Data Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="uint8">uint8 (0-255)</option>
            <option value="uint16">uint16 (0-65535)</option>
            <option value="uint32">uint32 (0-4294967295)</option>
            <option value="uint64">uint64 (larger values)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleEncrypt}
        disabled={isEncrypting || !value}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-200">Error: {error.message}</p>
        </div>
      )}

      {encryptedResult && (
        <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg">
          <p className="text-sm font-medium mb-2">Encrypted Result:</p>
          <code className="block p-2 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
            {encryptedResult}
          </code>
        </div>
      )}
    </div>
  );
}
