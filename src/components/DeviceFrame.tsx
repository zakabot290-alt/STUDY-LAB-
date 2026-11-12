import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Volume2, VolumeX, Globe, Code2, Download } from 'lucide-react';
import { useStudyLabStore } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { soundEngine } from '../lib/soundEngine';
import { exportCompleteAndroidProjectZip } from '../lib/projectExporter';

interface DeviceFrameProps {
  children: React.ReactNode;
  onOpenSourceModal: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, onOpenSourceModal }) => {
  const { profile, toggleLanguage, toggleSound } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  // Default to mobile frame mode on wider screens, but expand if user prefers
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleFrame = () => {
    soundEngine.playClick();
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#040507] text-[#F5F6FA] flex flex-col items-center justify-start p-0 md:py-6 md:px-4">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl mb-4 px-4 py-2.5 bg-[#151720]/90 backdrop-blur-md border border-[#202333] rounded-2xl flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#42A5E8] to-[#9275FF] flex items-center justify-center font-black text-sm text-[#08090D] shadow-md shadow-[#42A5E8]/20">
            SL
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-[#F5F6FA]">
              STUDY LAB
            </span>
            <span className="text-[10px] text-[#A0A5B5] hidden sm:inline">
              Infinix Smart 9 Class · ARM 32/64-bit · Android OS
            </span>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* One-Click Export App Button */}
          <button
            onClick={() => exportCompleteAndroidProjectZip()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#42A5E8] to-[#9275FF] hover:brightness-110 text-xs font-bold text-[#08090D] shadow-md shadow-[#42A5E8]/20 transition-all active:scale-95"
            title="Export complete Android Studio project (.zip)"
          >
            <Download className="w-3.5 h-3.5 text-[#08090D]" />
            <span>Export App</span>
          </button>

          {/* Source Code Modal Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSourceModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202333] hover:bg-[#282d42] border border-[#42A5E8]/30 text-xs font-medium text-[#42A5E8] transition-colors"
            title="View Android Kotlin & Room Code"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.androidCode}</span>
          </button>

          {/* Device Frame / Desktop Mode Toggle */}
          <button
            onClick={handleToggleFrame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-medium text-[#F5F6FA] transition-colors"
            title={isExpanded ? t.deviceMode : t.desktopMode}
          >
            {isExpanded ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#42A5E8]" />
                <span className="hidden sm:inline">{t.deviceMode}</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#9275FF]" />
                <span className="hidden sm:inline">{t.desktopMode}</span>
              </>
            )}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs text-[#A0A5B5] hover:text-[#F5F6FA] transition-colors flex items-center gap-1"
            title={profile.soundEnabled ? t.soundOn : t.soundOff}
          >
            {profile.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#00E676]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#A0A5B5]" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-semibold text-[#42A5E8] transition-colors"
            title="Switch Language (AR / EN)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{profile.preferredLanguage === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        className={`
          w-full transition-all duration-300
          ${
            isExpanded
              ? 'max-w-5xl rounded-3xl border border-[#202333] bg-[#08090D] shadow-2xl overflow-hidden'
              : 'max-w-[420px] rounded-[48px] border-[10px] border-[#181a24] bg-[#08090D] shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10'
          }
        `}
      >
        {/* Smartphone Shell Header (Shown in Phone Mode) */}
        {!isExpanded && (
          <div className="w-full bg-[#08090D] px-6 pt-3 pb-1 flex items-center justify-between text-[11px] text-[#A0A5B5] font-semibold select-none border-b border-[#151720]">
            <span className="tabular-nums font-mono text-[#F5F6FA]">{currentTime}</span>

            {/* Central Camera Punch-Hole & Earpiece slit */}
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#202333] shadow-inner" />
              <div className="w-8 h-1 rounded-full bg-[#181a24]" />
            </div>

            {/* Battery, Wifi & 4G Icons */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#A0A5B5]">
              <span>4G</span>
              <span>📶</span>
              <span className="text-[#00E676]">98%</span>
            </div>
          </div>
        )}

        {/* Scrollable View Body */}
        <div className={`w-full overflow-y-auto ${isExpanded ? 'min-h-[85vh]' : 'h-[780px] max-h-[88vh]'}`}>
          {children}
        </div>

        {/* Android Navigation Gesture Pill (Shown in Phone Mode) */}
        {!isExpanded && (
          <div className="w-full bg-[#08090D] py-2 flex items-center justify-center border-t border-[#151720]/80">
            <div className="w-28 h-1 bg-[#2c3247] rounded-full hover:bg-[#42A5E8] transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};
