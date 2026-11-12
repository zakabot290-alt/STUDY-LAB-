import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Cloud,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useStudyLabStore, getXpRequiredForLevel } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { StudyCard } from '../components/StudyCard';
import { StudyProgressBar } from '../components/StudyProgressBar';

export const ProfileView: React.FC = () => {
  const {
    profile,
    subjects,
    achievements,
    xpTransactions,
    exportBackupJson,
    importBackupJson,
    resetToFactoryDefaults,
  } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const xpNeeded = getXpRequiredForLevel(profile.level);
  const totalHours = (profile.totalStudyMinutes / 60).toFixed(1);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          setImportStatus(t.backupImportSuccess);
        } else {
          setImportStatus('Failed to parse backup JSON file.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const ranksInfo = [
    { tier: 'E', range: 'Lv 1-10', name: 'Apprentice' },
    { tier: 'D', range: 'Lv 11-20', name: 'Explorer' },
    { tier: 'C', range: 'Lv 21-35', name: 'Scholar' },
    { tier: 'B', range: 'Lv 36-50', name: 'Strategist' },
    { tier: 'A', range: 'Lv 51-75', name: 'Grandmaster' },
    { tier: 'S', range: 'Lv 76-100', name: 'Sovereign' },
  ];

  return (
    <div className="flex flex-col p-4 space-y-4 pb-24">
      {/* 1. Header Profile & Rank Banner */}
      <StudyCard variant="highlight" className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#42A5E8] to-[#9275FF] flex items-center justify-center text-lg font-black text-[#08090D] shadow-lg shadow-[#42A5E8]/20">
            {profile.displayName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#F5F6FA] leading-tight">
              {profile.displayName}
            </h1>
            <span className="text-xs text-[#42A5E8] font-medium block">
              {t.commander} · Tier {profile.rankTier}
            </span>
          </div>
          <div className="text-end">
            <span className="text-xs font-mono font-bold text-[#9275FF] block">
              {t.level} {profile.level}
            </span>
            <span className="text-[10px] text-[#A0A5B5] font-mono">
              {profile.currentXp}/{xpNeeded} XP
            </span>
          </div>
        </div>

        <StudyProgressBar
          progress={profile.currentXp / xpNeeded}
          color="bg-gradient-to-r from-[#42A5E8] to-[#9275FF]"
        />
      </StudyCard>

      {/* 2. Key Analytics Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <StudyCard className="p-3 text-center">
          <span className="text-[10px] text-[#A0A5B5] block mb-0.5">{t.studyHoursLabel}</span>
          <span className="text-base font-bold font-mono text-[#42A5E8]">{totalHours}h</span>
        </StudyCard>

        <StudyCard className="p-3 text-center">
          <span className="text-[10px] text-[#A0A5B5] block mb-0.5">{t.completedLessons}</span>
          <span className="text-base font-bold font-mono text-[#00E676]">{profile.completedLessonsCount}</span>
        </StudyCard>

        <StudyCard className="p-3 text-center">
          <span className="text-[10px] text-[#A0A5B5] block mb-0.5">{t.streakDays}</span>
          <span className="text-base font-bold font-mono text-[#FFAB40] flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {profile.streakDays}d
          </span>
        </StudyCard>
      </div>

      {/* 3. Rank Tier Roadmap */}
      <StudyCard className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5F6FA]">{t.rankTierDesc}</span>
          <span className="text-[10px] font-mono text-[#A0A5B5]">Levels 1–100</span>
        </div>
        <div className="grid grid-cols-6 gap-1 pt-1">
          {ranksInfo.map(r => {
            const isCurrent = profile.rankTier === r.tier;
            return (
              <div
                key={r.tier}
                className={`p-1.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-[#9275FF]/20 border-[#9275FF] text-[#9275FF] font-bold shadow-md'
                    : 'bg-[#202333]/50 border-[#2c3247]/50 text-[#A0A5B5]'
                }`}
              >
                <span className="text-xs font-bold block">{r.tier}</span>
                <span className="text-[8px] font-mono block">{r.range}</span>
              </div>
            );
          })}
        </div>
      </StudyCard>

      {/* 4. Subject Completion Percentages */}
      <StudyCard className="p-3.5 space-y-2.5">
        <span className="text-xs font-bold text-[#F5F6FA] block">
          {t.timeSpentPerSubject}
        </span>
        <div className="space-y-2">
          {subjects.map(s => {
            const allLessons = s.chapters.flatMap(c => c.units.flatMap(u => u.lessons));
            const completed = allLessons.filter(l => l.status === 'completed').length;
            const pct = allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0;

            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F5F6FA] font-medium">
                    {profile.preferredLanguage === 'ar' ? s.nameAr : s.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#A0A5B5]">{pct}%</span>
                </div>
                <StudyProgressBar progress={pct / 100} color="bg-[#42A5E8]" height="h-1.5" />
              </div>
            );
          })}
        </div>
      </StudyCard>

      {/* 5. Achievements Gallery */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#A0A5B5] uppercase tracking-wider">
          {t.achievementsLabel}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map(ach => (
            <StudyCard
              key={ach.id}
              className={`p-3 transition-colors ${
                ach.unlocked
                  ? 'border-[#00E676]/30 bg-[#151720]'
                  : 'border-[#202333] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2
                  className={`w-4 h-4 ${ach.unlocked ? 'text-[#00E676]' : 'text-[#A0A5B5]'}`}
                />
                <span className="text-xs font-bold text-[#F5F6FA] truncate">
                  {profile.preferredLanguage === 'ar' ? ach.titleAr : ach.title}
                </span>
              </div>
              <p className="text-[10px] text-[#A0A5B5] line-clamp-2">
                {profile.preferredLanguage === 'ar' ? ach.descriptionAr : ach.description}
              </p>
            </StudyCard>
          ))}
        </div>
      </div>

      {/* 6. Immutable XP Ledger (Auditable Transaction Table) */}
      <StudyCard className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5F6FA] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#42A5E8]" />
            {t.ledgerTitle}
          </span>
          <span className="text-[10px] font-mono text-[#A0A5B5]">
            {xpTransactions.length} Total Awards
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {xpTransactions.slice(0, 8).map(tx => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2 rounded-xl bg-[#202333]/50 text-xs border border-[#2c3247]/40"
            >
              <div className="flex flex-col truncate pr-2">
                <span className="text-[11px] font-medium text-[#F5F6FA] truncate">
                  {profile.preferredLanguage === 'ar' ? tx.descriptionAr : tx.description}
                </span>
                <span className="text-[9px] font-mono text-[#A0A5B5]">
                  {new Date(tx.awardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {tx.sourceType}
                </span>
              </div>
              <span className="text-[11px] font-bold font-mono text-[#00E676] shrink-0">
                +{tx.amount} XP
              </span>
            </div>
          ))}
        </div>
      </StudyCard>

      {/* 7. Local Backup, Restore & Cloud Sync Abstraction */}
      <StudyCard className="p-3.5 space-y-3">
        <div>
          <span className="text-xs font-bold text-[#F5F6FA] block">{t.dataManagement}</span>
          <span className="text-[10px] text-[#A0A5B5] block">
            100% Offline-First. Backups are exported as standardized versioned JSON files.
          </span>
        </div>

        {importStatus && (
          <div className="p-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-xs text-[#00E676] font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportBackupJson}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-semibold text-[#42A5E8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportBackup}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-semibold text-[#9275FF] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.importBackup}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="p-2.5 rounded-xl bg-[#202333]/40 border border-[#2c3247]/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#42A5E8]" />
            <span className="text-[11px] text-[#F5F6FA]">{t.cloudSyncTitle}</span>
          </div>
          <span className="text-[10px] font-mono text-[#00E676]">
            {t.cloudSyncStatus}
          </span>
        </div>

        {/* Factory Reset */}
        <div className="pt-1 text-center">
          <button
            onClick={() => {
              if (window.confirm('Reset all progress and restore factory starter templates?')) {
                resetToFactoryDefaults();
              }
            }}
            className="text-[10px] text-[#FF5252] hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.resetDefaults}</span>
          </button>
        </div>
      </StudyCard>

      {/* Target Device Profile Footer */}
      <div className="text-center text-[10px] text-[#A0A5B5] pt-2">
        {t.infinixNotice}
      </div>
    </div>
  );
};
