import React from 'react';
import { Home, BookOpen, Brain, Sparkles, User } from 'lucide-react';
import { useStudyLabStore } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { soundEngine } from '../lib/soundEngine';

export type NavTab = 'home' | 'study' | 'brain' | 'skills' | 'profile';

interface StudyBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const StudyBottomNav: React.FC<StudyBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { profile } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-5 h-5" /> },
    { id: 'study', label: t.navStudy, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'brain', label: t.navBrain, icon: <Brain className="w-5 h-5" /> },
    { id: 'skills', label: t.navSkills, icon: <Sparkles className="w-5 h-5" /> },
    { id: 'profile', label: t.navProfile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-[#151720]/95 backdrop-blur-md border-t border-[#202333] px-2 py-1 shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const isSelected = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                onSelectTab(tab.id);
              }}
              className={`
                min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95
                ${isSelected ? 'text-[#42A5E8]' : 'text-[#A0A5B5] hover:text-[#F5F6FA]'}
              `}
            >
              <div
                className={`
                  p-1 rounded-xl transition-all
                  ${isSelected ? 'bg-[#42A5E8]/10' : ''}
                `}
              >
                {tab.icon}
              </div>
              <span
                className={`
                  text-[10px] font-medium tracking-tight mt-0.5 truncate
                  ${isSelected ? 'font-bold text-[#42A5E8]' : 'text-[#A0A5B5]'}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
