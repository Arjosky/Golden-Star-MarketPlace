import React, { useState, useEffect } from 'react';
import { WifiOff, Check } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <aside aria-label="Offline Alert" className="bg-amber-600 text-neutral-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>You are currently offline. Cached clearance catalog and seller desk data are still accessible.</span>
      </aside>
    );
  }

  if (showReconnected) {
    return (
      <aside aria-label="Reconnected Alert" className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50">
        <Check className="w-4 h-4 shrink-0" />
        <span>Connected back online. Real-time clearance inventory active.</span>
      </aside>
    );
  }

  return null;
}
