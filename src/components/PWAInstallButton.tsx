import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'floating' | 'banner';
}

export function PWAInstallButton({ className = '', variant = 'navbar' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  // If already installed, show subtle badge or return null
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">PWA Installed</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Show iOS / manual instructions
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          variant === 'banner'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 hover:border-amber-400/60'
        } ${className}`}
        title="Install Golden Star PWA for offline access & faster liquidation"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-100 font-serif">Install Golden Star App</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              To install this PWA on iOS / Safari or Chrome:
            </p>
            <div className="text-left bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (Safari) or <strong>Menu ⋮</strong> (Chrome).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <span>Select <strong>'Add to Home Screen'</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                <span>Launch instantly from your home screen for offline clearance tracking!</span>
              </div>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
