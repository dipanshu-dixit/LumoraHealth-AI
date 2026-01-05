'use client';

import { useEffect, useState } from 'react';
import { getStorageInfo, formatBytes } from '../lib/storageMonitor';
import { HardDrive, AlertTriangle } from 'lucide-react';

export default function StorageUsageCard() {
  const [storageInfo, setStorageInfo] = useState<ReturnType<typeof getStorageInfo> | null>(null);

  useEffect(() => {
    const updateStorage = () => {
      setStorageInfo(getStorageInfo());
    };

    updateStorage();
    const interval = setInterval(updateStorage, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!storageInfo) return null;

  const getStatusColor = () => {
    if (storageInfo.isCritical) return 'text-red-500';
    if (storageInfo.isWarning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBarColor = () => {
    if (storageInfo.isCritical) return 'bg-red-500';
    if (storageInfo.isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Storage Usage</h3>
        </div>
        {(storageInfo.isWarning || storageInfo.isCritical) && (
          <AlertTriangle className={`w-5 h-5 ${getStatusColor()}`} />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Used Space</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              {formatBytes(storageInfo.used)} / 10 MB
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">0%</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {storageInfo.percentage}%
            </span>
            <span className="text-gray-500">100%</span>
          </div>
        </div>

        {storageInfo.isCritical && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">
              ⚠️ Storage is almost full! Clear old conversations to continue using Lumora.
            </p>
          </div>
        )}

        {storageInfo.isWarning && !storageInfo.isCritical && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-400">
              ⚠️ Storage is getting full. Consider clearing old data.
            </p>
          </div>
        )}

        {!storageInfo.isWarning && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-400">
              ✓ Storage is healthy. You have plenty of space available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
