import { useState } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { StudyBottomNav, NavTab } from './components/StudyBottomNav';
import { HomeView } from './views/HomeView';
import { StudyView } from './views/StudyView';
import { BrainView } from './views/BrainView';
import { SkillsView } from './views/SkillsView';
import { ProfileView } from './views/ProfileView';
import { SourceCodeModal } from './views/SourceCodeModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#040507] text-[#F5F6FA]">
      <DeviceFrame onOpenSourceModal={() => setIsSourceModalOpen(true)}>
        <div className="flex flex-col min-h-full relative">
          {/* Active View Container */}
          <main className="flex-1">
            {currentTab === 'home' && (
              <HomeView
                onNavigateTab={tab => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'study' && <StudyView />}
            {currentTab === 'brain' && <BrainView />}
            {currentTab === 'skills' && <SkillsView />}
            {currentTab === 'profile' && <ProfileView />}
          </main>

          {/* Persistent Android Bottom Navigation */}
          <StudyBottomNav
            currentTab={currentTab}
            onSelectTab={tab => setCurrentTab(tab)}
          />
        </div>
      </DeviceFrame>

      {/* PWA In-App Install Prompt */}
      <PWAInstallPrompt />

      {/* Android Kotlin & Room Source Code Explorer Modal */}
      <SourceCodeModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />
    </div>
  );
}
