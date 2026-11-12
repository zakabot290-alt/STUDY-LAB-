import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    soundEngine.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-16 right-4 z-40">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#42A5E8] hover:bg-[#3894d1] text-[#08090D] font-bold text-xs shadow-xl shadow-[#42A5E8]/30 transition-all active:scale-95 animate-bounce"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151720] border border-[#202333] p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#42A5E8]" />
                <h3 className="text-sm font-bold text-[#F5F6FA]">Install STUDY LAB</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-[#A0A5B5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A0A5B5] leading-relaxed">
              To install on iPhone or iPad:<br />
              1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-[#202333] hover:bg-[#282d42] text-xs font-bold text-[#F5F6FA] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
