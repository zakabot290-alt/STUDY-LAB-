import React, { useState } from 'react';
import {
  Search,
  Zap,
  Timer,
  Brain,
  Layers,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useStudyLabStore, getXpRequiredForLevel } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { StudyCard } from '../components/StudyCard';
import { StudyProgressBar } from '../components/StudyProgressBar';
import { StudyCircularProgress } from '../components/StudyCircularProgress';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'study' | 'brain' | 'skills' | 'profile') => void;
  onSelectSubject?: (subjectId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab, onSelectSubject }) => {
  const { profile, subjects, quests, claimQuestReward } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const [searchQuery, setSearchQuery] = useState('');

  // Daily statistics computation
  const totalLessons = subjects.reduce(
    (acc, s) => acc + s.chapters.reduce((cAcc, c) => cAcc + c.units.reduce((uAcc, u) => uAcc + u.lessons.length, 0), 0),
    0
  );
  const completedLessons = subjects.reduce(
    (acc, s) =>
      acc +
      s.chapters.reduce(
        (cAcc, c) =>
          cAcc +
          c.units.reduce(
            (uAcc, u) => uAcc + u.lessons.filter(l => l.status === 'completed').length,
            0
          ),
        0
      ),
    0
  );

  const overallProgress = totalLessons > 0 ? completedLessons / totalLessons : 0;
  const xpNeeded = getXpRequiredForLevel(profile.level);
  const levelProgress = xpNeeded > 0 ? profile.currentXp / xpNeeded : 0;

  // Filter subjects for search
  const filteredSubjects = subjects.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr.includes(searchQuery)
  );

  return (
    <div className="flex flex-col p-4 space-y-5 pb-24">
      {/* 1. Header Greeting & Circular Daily Metric */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-[#A0A5B5] font-medium">
            {t.welcomeBack}
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F6FA] flex items-center gap-2">
            <span>{profile.displayName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#42A5E8]/10 text-[#42A5E8] border border-[#42A5E8]/30 font-mono">
              Tier {profile.rankTier}
            </span>
          </h1>
        </div>

        <StudyCircularProgress
          progress={overallProgress}
          size={56}
          strokeWidth={5}
          color="#42A5E8"
          centerText={`${Math.round(overallProgress * 100)}%`}
          subText="Done"
        />
      </div>

      {/* 2. Interactive Search Bar */}
      <div className="relative">
        <Search className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 w-4 h-4 text-[#A0A5B5]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-[#151720] border border-[#202333] rounded-xl px-10 py-2.5 text-xs text-[#F5F6FA] placeholder-[#A0A5B5] focus:outline-none focus:border-[#42A5E8] transition-colors"
        />
      </div>

      {/* 3. RPG Level & XP Progression Card */}
      <StudyCard variant="highlight" className="border-l-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#9275FF]/20 text-[#9275FF]">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#F5F6FA]">
                {t.rank}: Tier {profile.rankTier}
              </span>
              <span className="text-[10px] text-[#A0A5B5] block">
                {t.level} {profile.level}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#42A5E8]">
            {profile.currentXp} / {xpNeeded} {t.xp}
          </span>
        </div>

        <StudyProgressBar progress={levelProgress} color="bg-gradient-to-r from-[#42A5E8] to-[#9275FF]" />

        <div className="flex items-center justify-between mt-2 text-[10px] text-[#A0A5B5]">
          <span>{xpNeeded - profile.currentXp} {t.xpToNext}</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFAB40]" />
            {profile.streakDays} {t.streakDays}
          </span>
        </div>
      </StudyCard>

      {/* 4. Quick Action Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#A0A5B5] uppercase tracking-wider">
          {t.quickActions}
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <StudyCard
            variant="secondary"
            onClick={() => onNavigateTab('skills')}
            className="flex flex-col items-center justify-center p-3 text-center"
          >
            <div className="p-2 rounded-xl bg-[#42A5E8]/10 text-[#42A5E8] mb-1.5">
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-[#F5F6FA] leading-tight line-clamp-1">
              {t.startFocusSession}
            </span>
          </StudyCard>

          <StudyCard
            variant="secondary"
            onClick={() => onNavigateTab('brain')}
            className="flex flex-col items-center justify-center p-3 text-center"
          >
            <div className="p-2 rounded-xl bg-[#9275FF]/10 text-[#9275FF] mb-1.5">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-[#F5F6FA] leading-tight line-clamp-1">
              {t.dailyBrainChallenge}
            </span>
          </StudyCard>

          <StudyCard
            variant="secondary"
            onClick={() => onNavigateTab('brain')}
            className="flex flex-col items-center justify-center p-3 text-center"
          >
            <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676] mb-1.5">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-[#F5F6FA] leading-tight line-clamp-1">
              {t.reviewFlashcards}
            </span>
          </StudyCard>
        </div>
      </div>

      {/* 5. Daily & Weekly Quests */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#A0A5B5] uppercase tracking-wider">
            {t.dailyQuests}
          </span>
          <span className="text-[10px] text-[#42A5E8] font-mono">
            {quests.filter(q => q.isClaimed).length}/{quests.length} {t.claimed}
          </span>
        </div>

        <div className="space-y-2">
          {quests.map(quest => {
            const isReady = quest.currentCount >= quest.targetCount && !quest.isClaimed;
            const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);

            return (
              <StudyCard key={quest.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F5F6FA]">
                        {profile.preferredLanguage === 'ar' ? quest.titleAr : quest.title}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <StudyProgressBar
                        progress={progressRatio}
                        color={isReady ? 'bg-[#00E676]' : 'bg-[#42A5E8]'}
                        className="w-28"
                        height="h-1.5"
                      />
                      <span className="text-[10px] font-mono text-[#A0A5B5]">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {quest.isClaimed ? (
                      <span className="text-[10px] text-[#A0A5B5] flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                        {t.claimed}
                      </span>
                    ) : isReady ? (
                      <button
                        onClick={() => claimQuestReward(quest.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#00E676] hover:bg-[#00c864] text-[#08090D] font-bold text-[11px] shadow-md shadow-[#00E676]/20 transition-all active:scale-95"
                      >
                        +{quest.xpReward} XP
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#9275FF] font-mono font-semibold">
                        +{quest.xpReward} XP
                      </span>
                    )}
                  </div>
                </div>
              </StudyCard>
            );
          })}
        </div>
      </div>

      {/* 6. Active Classes & Learning Paths */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#A0A5B5] uppercase tracking-wider">
            {t.myClasses}
          </span>
          <button
            onClick={() => onNavigateTab('study')}
            className="text-[11px] text-[#42A5E8] hover:underline flex items-center gap-0.5"
          >
            <span>{t.filterAll} ({subjects.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {filteredSubjects.slice(0, 3).map(subject => {
            const subjLessons = subject.chapters.flatMap(c => c.units.flatMap(u => u.lessons));
            const completedCount = subjLessons.filter(l => l.status === 'completed').length;
            const progress = subjLessons.length > 0 ? completedCount / subjLessons.length : 0;

            return (
              <StudyCard
                key={subject.id}
                onClick={() => {
                  if (onSelectSubject) onSelectSubject(subject.id);
                  onNavigateTab('study');
                }}
                className="p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: subject.colorHex }}
                    />
                    <span className="text-xs font-bold text-[#F5F6FA]">
                      {profile.preferredLanguage === 'ar' ? subject.nameAr : subject.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A0A5B5]">
                    {completedCount}/{subjLessons.length}
                  </span>
                </div>

                <StudyProgressBar progress={progress} color="bg-[#42A5E8]" height="h-1.5" />
              </StudyCard>
            );
          })}
        </div>
      </div>

      {/* 7. Upcoming Deadlines */}
      <StudyCard className="p-3 bg-[#151720]/60">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-[#42A5E8]" />
          <span className="text-xs font-semibold text-[#F5F6FA]">
            {t.upcomingDeadlines}
          </span>
        </div>
        <div className="space-y-1.5">
          {subjects
            .filter(s => s.deadlineTimestamp)
            .slice(0, 2)
            .map(s => {
              const daysLeft = Math.ceil(
                ((s.deadlineTimestamp || 0) - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={s.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[#202333]/50 last:border-0">
                  <span className="text-[#A0A5B5]">
                    {profile.preferredLanguage === 'ar' ? s.nameAr : s.name}
                  </span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${daysLeft <= 3 ? 'bg-[#FF5252]/10 text-[#FF5252]' : 'text-[#42A5E8]'}`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                  </span>
                </div>
              );
            })}
        </div>
      </StudyCard>
    </div>
  );
};
