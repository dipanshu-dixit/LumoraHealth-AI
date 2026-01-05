export interface StorageInfo {
  used: number;
  usedMB: number;
  percentage: number;
  isWarning: boolean;
  isCritical: boolean;
}

const WARNING_THRESHOLD_MB = 5;
const CRITICAL_THRESHOLD_MB = 8;

export function getStorageInfo(): StorageInfo {
  let totalSize = 0;
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  
  // Convert to bytes (each character is 2 bytes in UTF-16)
  const usedBytes = totalSize * 2;
  const usedMB = usedBytes / (1024 * 1024);
  
  // Most browsers allow 5-10MB for localStorage
  const maxMB = 10;
  const percentage = (usedMB / maxMB) * 100;
  
  return {
    used: usedBytes,
    usedMB: parseFloat(usedMB.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(1)),
    isWarning: usedMB >= WARNING_THRESHOLD_MB,
    isCritical: usedMB >= CRITICAL_THRESHOLD_MB
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
