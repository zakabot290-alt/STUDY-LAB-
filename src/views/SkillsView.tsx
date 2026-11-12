import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { useStudyLabStore } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { StudyCard } from '../components/StudyCard';
import { StudyProgressBar } from '../components/StudyProgressBar';
import { soundEngine } from '../lib/soundEngine';

export const SkillsView: React.FC = () => {
  const {
    profile,
    subjects,
    focusSessions,
    skillNodes,
    recordFocusSession,
    unlockSkillNode,
  } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const [activeTab, setActiveTab] = useState<'focus' | 'tree'>('focus');

  // --- FOCUS TIMER STATE ---
  const [presetDurationMinutes, setPresetDurationMinutes] = useState<number>(25);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [linkedSubjectId, setLinkedSubjectId] = useState<string>('');
  const [ambientSoundActive, setAmbientSoundActive] = useState<boolean>(false);

  // Interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            soundEngine.playTimerComplete();
            if (ambientSoundActive) {
              soundEngine.stopAmbientFocus();
              setAmbientSoundActive(false);
            }
            recordFocusSession(presetDurationMinutes, presetDurationMinutes === 25 ? '25/5' : '50/10', linkedSubjectId);
            return totalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, presetDurationMinutes, linkedSubjectId, totalSeconds, ambientSoundActive]);

  const handleStartTimer = () => {
    soundEngine.playClick();
    setTimerRunning(true);
    if (ambientSoundActive) {
      soundEngine.startAmbientFocus();
    }
  };

  const handlePauseTimer = () => {
    soundEngine.playClick();
    setTimerRunning(false);
    if (ambientSoundActive) {
      soundEngine.stopAmbientFocus();
    }
  };

  const handleResetTimer = () => {
    soundEngine.playClick();
    setTimerRunning(false);
    setSecondsRemaining(totalSeconds);
    if (ambientSoundActive) {
      soundEngine.stopAmbientFocus();
      setAmbientSoundActive(false);
    }
  };

  const handleSelectPreset = (minutes: number) => {
    soundEngine.playClick();
    setTimerRunning(false);
    setPresetDurationMinutes(minutes);
    setTotalSeconds(minutes * 60);
    setSecondsRemaining(minutes * 60);
    if (ambientSoundActive) {
      soundEngine.stopAmbientFocus();
      setAmbientSoundActive(false);
    }
  };

  const toggleAmbientSound = () => {
    soundEngine.playClick();
    const nextState = !ambientSoundActive;
    setAmbientSoundActive(nextState);
    if (nextState && timerRunning) {
      soundEngine.startAmbientFocus();
    } else {
      soundEngine.stopAmbientFocus();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;

  // --- SKILL TREE STATE ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Mathematics');
  const filteredNodes = skillNodes.filter(n => n.category === selectedCategory);

  const categories = [
    'Mathematics',
    'Logical Thinking',
    'Programming',
    'English Language',
    'Problem Solving',
    'Research Skills',
    'Learning Techniques',
  ];

  return (
    <div className="flex flex-col p-4 space-y-4 pb-24">
      {/* 1. Header & Tab Switcher */}
      <h1 className="text-lg font-bold text-[#F5F6FA]">{t.skillsHubTitle}</h1>

      <div className="flex items-center p-1 bg-[#151720] border border-[#202333] rounded-2xl">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('focus');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'focus'
              ? 'bg-[#202333] text-[#42A5E8] shadow-md border border-[#42A5E8]/30'
              : 'text-[#A0A5B5] hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{t.tabFocus}</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('tree');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'tree'
              ? 'bg-[#202333] text-[#9275FF] shadow-md border border-[#9275FF]/30'
              : 'text-[#A0A5B5] hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>{t.tabSkills}</span>
        </button>
      </div>

      {/* 2. TAB A: DEEP FOCUS TIMER */}
      {activeTab === 'focus' && (
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectPreset(25)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                presetDurationMinutes === 25
                  ? 'bg-[#42A5E8]/20 border-[#42A5E8] text-[#42A5E8] font-bold shadow-md'
                  : 'bg-[#151720] border-[#202333] text-[#A0A5B5] hover:text-white'
              }`}
            >
              {t.preset25}
            </button>

            <button
              onClick={() => handleSelectPreset(50)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                presetDurationMinutes === 50
                  ? 'bg-[#9275FF]/20 border-[#9275FF] text-[#9275FF] font-bold shadow-md'
                  : 'bg-[#151720] border-[#202333] text-[#A0A5B5] hover:text-white'
              }`}
            >
              {t.preset50}
            </button>
          </div>

          {/* Large Animated Circular Timer */}
          <StudyCard className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="relative w-52 h-52 flex items-center justify-center my-2">
              <svg width="208" height="208" className="transform -rotate-90">
                {/* Track Circle */}
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  stroke="#202333"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  stroke="#42A5E8"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 92}
                  strokeDashoffset={2 * Math.PI * 92 * (1 - timerProgress)}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Central Time & State */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-[#F5F6FA] tracking-tighter">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-[11px] text-[#A0A5B5] mt-1 font-medium">
                  {timerRunning ? t.timerRunning : timerProgress > 0 ? t.timerPaused : t.timerReady}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              {!timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42A5E8] hover:bg-[#3894d1] text-[#08090D] font-bold text-xs shadow-lg shadow-[#42A5E8]/20 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{timerProgress > 0 ? t.resumeTimer : t.startTimer}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFAB40] hover:bg-[#e69935] text-[#08090D] font-bold text-xs shadow-lg shadow-[#FFAB40]/20 transition-all active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{t.pauseTimer}</span>
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-2.5 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-[#A0A5B5] hover:text-white transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </StudyCard>

          {/* Focus Sound & Subject Linking Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Ambient Sound Switch */}
            <button
              onClick={toggleAmbientSound}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                ambientSoundActive
                  ? 'bg-[#42A5E8]/10 border-[#42A5E8]/40 text-[#42A5E8]'
                  : 'bg-[#151720] border-[#202333] text-[#A0A5B5]'
              }`}
            >
              <div className="flex items-center gap-2">
                {ambientSoundActive ? <Volume2 className="w-4 h-4 text-[#42A5E8]" /> : <VolumeX className="w-4 h-4" />}
                <span className="font-medium">{t.ambientSoundLabel}</span>
              </div>
              <span className="text-[10px] font-mono">{ambientSoundActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* Link Subject Dropdown */}
            <div className="p-2.5 rounded-xl bg-[#151720] border border-[#202333] flex items-center gap-2">
              <span className="text-[11px] text-[#A0A5B5] shrink-0">Subject:</span>
              <select
                value={linkedSubjectId}
                onChange={e => setLinkedSubjectId(e.target.value)}
                className="w-full bg-transparent text-xs text-[#F5F6FA] focus:outline-none truncate"
              >
                <option value="" className="bg-[#151720] text-[#A0A5B5]">
                  {t.noneSubject}
                </option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#151720] text-[#F5F6FA]">
                    {profile.preferredLanguage === 'ar' ? s.nameAr : s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recent Focus Session Log */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-[#A0A5B5] uppercase tracking-wider">
              {t.recentFocusHistory}
            </span>
            {focusSessions.length > 0 ? (
              <div className="space-y-1.5">
                {focusSessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    className="p-2.5 rounded-xl bg-[#151720] border border-[#202333] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-[#42A5E8]" />
                      <span className="text-[#F5F6FA] font-medium">{session.durationMinutes} Minutes Focus</span>
                    </div>
                    <span className="text-[#00E676] font-mono font-bold text-[11px]">
                      +{session.earnedXp} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A0A5B5] py-2">
                Complete a session to record your focus history.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB B: RPG SKILL TREE */}
      {activeTab === 'tree' && (
        <div className="space-y-4">
          {/* Discipline Category Horizontal Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#9275FF]/20 border-[#9275FF] text-[#9275FF] font-bold shadow-sm'
                    : 'bg-[#151720] border-[#202333] text-[#A0A5B5] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Interactive Visual Skill Graph Nodes */}
          <div className="space-y-3">
            {filteredNodes.map((node, idx) => (
              <StudyCard
                key={node.id}
                className={`p-4 transition-all ${
                  node.unlocked
                    ? 'border-[#9275FF]/40 bg-gradient-to-br from-[#151720] to-[#1c1a2e]'
                    : 'border-[#202333] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F5F6FA]">
                        {profile.preferredLanguage === 'ar' ? node.titleAr : node.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202333] text-[#A0A5B5]">
                        Tier {node.tier}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A5B5] mt-1">
                      {profile.preferredLanguage === 'ar' ? node.descriptionAr : node.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {node.unlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#00E676] font-bold">
                        <Unlock className="w-3.5 h-3.5" />
                        {t.skillNodeUnlocked}
                      </span>
                    ) : (
                      <button
                        onClick={() => unlockSkillNode(node.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9275FF] hover:bg-[#8363fc] text-[#08090D] font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Unlock</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Challenges in this node */}
                <div className="space-y-1.5 pt-2 border-t border-[#202333]/60">
                  <span className="text-[10px] text-[#A0A5B5] font-semibold uppercase tracking-wider block">
                    Challenges:
                  </span>
                  {node.challenges.map(ch => (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#202333]/50"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${ch.completed ? 'text-[#00E676]' : 'text-[#A0A5B5]'}`}
                        />
                        <span className={`text-[11px] ${ch.completed ? 'line-through text-[#A0A5B5]' : 'text-[#F5F6FA]'}`}>
                          {profile.preferredLanguage === 'ar' ? ch.titleAr : ch.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#9275FF] font-semibold">
                        +{ch.xpReward} XP
                      </span>
                    </div>
                  ))}
                </div>
              </StudyCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
