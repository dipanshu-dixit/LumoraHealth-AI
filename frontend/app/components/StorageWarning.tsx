'use client';

'use client';

import { useEffect, useState } from 'react';
import { getStorageInfo, formatBytes } from '../lib/storageMonitor';
import { AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StorageWarning() {
  const [storageInfo, setStorageInfo] = useState<ReturnType<typeof getStorageInfo> | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkStorage = () => {
      const info = getStorageInfo();
      setStorageInfo(info);
    };

    checkStorage();
    const interval = setInterval(checkStorage, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  if (!storageInfo || dismissed || (!storageInfo.isWarning && !storageInfo.isCritical)) {
    return null;
  }

  const handleClearData = () => {
    router.push('/settings');
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4 ${
      storageInfo.isCritical ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'
    } border-2 rounded-lg p-4 backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
          storageInfo.isCritical ? 'text-red-500' : 'text-yellow-500'
        }`} />
        
        <div className="flex-1">
          <h3 className={`font-semibold ${
            storageInfo.isCritical ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {storageInfo.isCritical ? 'Storage Almost Full!' : 'Storage Warning'}
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            You're using {formatBytes(storageInfo.used)} ({storageInfo.percentage}%) of available storage.
            {storageInfo.isCritical 
              ? ' Please clear some data to continue using Lumora.'
              : ' Consider clearing old conversations to free up space.'}
          </p>
          <button
            onClick={handleClearData}
            className={`mt-2 px-4 py-1.5 rounded-lg text-sm font-medium ${
              storageInfo.isCritical 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white transition-colors`}
          >
            Clear Data in Settings
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
