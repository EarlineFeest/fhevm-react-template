'use client';

import { useState } from 'react';
import { useDecrypt, useFhevm } from '@fhevm/sdk/react';

export default function DecryptionDemo() {
  const { isInitialized } = useFhevm();
  const { decrypt, isDecrypting, error } = useDecrypt();
  const [contractAddress, setContractAddress] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [handle, setHandle] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [decryptedResult, setDecryptedResult] = useState<any>(null);

  const handleDecrypt = async () => {
    const result = await decrypt({
      contractAddress,
      handle,
      userAddress,
    });

    if (result) {
      setDecryptedResult(result);
    }
  };

  if (!isInitialized) {
    return <div className="text-center py-4">Initializing FHEVM client...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
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

        <div>
          <label className="block text-sm font-medium mb-2">Encrypted Handle</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">User Address</label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            placeholder="0x..."
          />
        </div>
      </div>

      <button
        onClick={handleDecrypt}
        disabled={isDecrypting || !handle || !userAddress}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
      </button>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-200">Error: {error.message}</p>
        </div>
      )}

      {decryptedResult && (
        <div className="p-4 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 rounded-lg">
          <p className="text-sm font-medium mb-2">Decryption Result:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Value:</span>
              <span className="font-mono">{decryptedResult.value.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span className="font-mono">{decryptedResult.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={decryptedResult.success ? 'text-green-600' : 'text-red-600'}>
                {decryptedResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
