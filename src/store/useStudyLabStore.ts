import { useState, useEffect } from 'react';
import {
  UserProfile,
  Subject,
  Lesson,
  Flashcard,
  FocusSession,
  SkillNode,
  XpTransaction,
  Quest,
  Achievement,
  LessonStatus,
  PriorityLevel,
  Language,
  RankTier,
} from '../types';
import { STARTER_SUBJECTS, STARTER_FLASHCARDS } from '../lib/templates';
import { INITIAL_SKILL_NODES } from '../lib/skillsData';
import { soundEngine } from '../lib/soundEngine';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'studylab_local_db_v2';

export function calculateRankTier(level: number): RankTier {
  if (level >= 76) return 'S';
  if (level >= 51) return 'A';
  if (level >= 36) return 'B';
  if (level >= 21) return 'C';
  if (level >= 11) return 'D';
  return 'E';
}

export function getXpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.3));
}

const INITIAL_PROFILE: UserProfile = {
  id: 'usr_commander_1',
  displayName: 'Tariq Al-Muhandis',
  level: 4,
  currentXp: 480,
  rankTier: 'E',
  totalStudyMinutes: 340,
  completedLessonsCount: 8,
  preferredLanguage: 'ar',
  soundEnabled: true,
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
};

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_daily_focus',
    title: 'Complete a 25-minute Focus Session',
    titleAr: 'إتمام جلسة تركيز عميق لمدة 25 دقيقة',
    targetCount: 1,
    currentCount: 0,
    xpReward: 35,
    isClaimed: false,
    type: 'daily',
    actionType: 'focus',
  },
  {
    id: 'q_daily_cards',
    title: 'Review 5 Spaced Repetition Flashcards',
    titleAr: 'مراجعة 5 بطاقات استذكار في محرك الذاكرة',
    targetCount: 5,
    currentCount: 3,
    xpReward: 25,
    isClaimed: false,
    type: 'daily',
    actionType: 'flashcard',
  },
  {
    id: 'q_daily_puzzle',
    title: 'Solve a Logic or Number Challenge in Brain Gym',
    titleAr: 'حل تحدي تفكير منطقي أو متتالية في مختبر العقل',
    targetCount: 1,
    currentCount: 0,
    xpReward: 30,
    isClaimed: false,
    type: 'daily',
    actionType: 'puzzle',
  },
  {
    id: 'q_weekly_mastery',
    title: 'Complete 3 Academic Lessons this week',
    titleAr: 'إكمال 3 دروس أكاديمية هذا الأسبوع',
    targetCount: 3,
    currentCount: 2,
    xpReward: 100,
    isClaimed: false,
    type: 'weekly',
    actionType: 'lesson',
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'Genesis of Mastery',
    titleAr: 'انطلاقة القائد المعرفي',
    description: 'Began the study journey and completed the initial diagnostic.',
    descriptionAr: 'بدء الرحلة التعليمية وإكمال الدرس الاستطلاعي الأول.',
    icon: 'Sparkles',
    unlocked: true,
    unlockedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'ach_focus_master',
    title: 'Deep Work Discipline',
    titleAr: 'سيد التركيز العميق',
    description: 'Completed over 300 total minutes of distraction-free focus.',
    descriptionAr: 'تجاوز 300 دقيقة من التركيز المتواصل بدون تشتت.',
    icon: 'Timer',
    unlocked: true,
    unlockedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'ach_memory_titan',
    title: 'Mnemosyne’s Ward',
    titleAr: 'حافظة الذاكرة الحديدية',
    description: 'Review 50 flashcards using spaced repetition algorithms.',
    descriptionAr: 'مراجعة 50 بطاقة استذكار بنظام التكرار المتباعد.',
    icon: 'Brain',
    unlocked: false,
  },
  {
    id: 'ach_rank_d',
    title: 'Ascension to Tier D',
    titleAr: 'الارتقاء إلى رتبة المستكشف (D)',
    description: 'Reach Level 11 in the RPG progression hierarchy.',
    descriptionAr: 'بلوغ المستوى 11 في سلم الرتب الأكاديمية.',
    icon: 'ShieldAlert',
    unlocked: false,
  },
];

const INITIAL_TRANSACTIONS: XpTransaction[] = [
  {
    id: 'tx_init_1',
    amount: 150,
    sourceType: 'WEEKLY_GOAL',
    sourceReferenceId: 'init_goal_1',
    description: 'Completed onboarding curriculum setup',
    descriptionAr: 'تهيئة الخطة الدراسية وتثبيت المناهج',
    awardedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'tx_init_2',
    amount: 30,
    sourceType: 'LESSON_COMPLETION',
    sourceReferenceId: 'les_calc_1',
    description: 'Completed Epsilon-Delta Limit foundations',
    descriptionAr: 'إكمال درس تعريف إبسيلون-دلتا في التفاضل',
    awardedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'tx_init_3',
    amount: 20,
    sourceType: 'FOCUS_SESSION',
    sourceReferenceId: 'focus_init_1',
    description: 'Completed 25-minute Pomodoro focus block',
    descriptionAr: 'إتمام 25 دقيقة تركيز بومودورو',
    awardedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

export function useStudyLabStore() {
  // State initialization
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [subjects, setSubjects] = useState<Subject[]>(STARTER_SUBJECTS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(STARTER_FLASHCARDS);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(INITIAL_SKILL_NODES);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>(INITIAL_TRANSACTIONS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.flashcards) setFlashcards(parsed.flashcards);
        if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
        if (parsed.skillNodes) setSkillNodes(parsed.skillNodes);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.xpTransactions) setXpTransactions(parsed.xpTransactions);
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on state change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        profile,
        subjects,
        flashcards,
        focusSessions,
        skillNodes,
        quests,
        achievements,
        xpTransactions,
        version: '2.0.0',
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [profile, subjects, flashcards, focusSessions, skillNodes, quests, achievements, xpTransactions, isLoaded]);

  // Synchronize HTML lang and dir attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = profile.preferredLanguage;
      document.documentElement.dir = profile.preferredLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [profile.preferredLanguage]);

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang: Language = profile.preferredLanguage === 'ar' ? 'en' : 'ar';
    setProfile(prev => ({ ...prev, preferredLanguage: nextLang }));
    soundEngine.playClick();
  };

  // Toggle Audio Mute
  const toggleSound = () => {
    const nextState = !profile.soundEnabled;
    soundEngine.setMuted(!nextState);
    setProfile(prev => ({ ...prev, soundEnabled: nextState }));
    if (nextState) {
      soundEngine.playClick();
    }
  };

  // Core Award XP Engine with Level Up check and Ledger verification
  const awardXp = (amount: number, sourceType: XpTransaction['sourceType'], sourceReferenceId: string, descEn: string, descAr: string) => {
    // Prevent duplicate awards for the same action
    const exists = xpTransactions.some(
      tx => tx.sourceType === sourceType && tx.sourceReferenceId === sourceReferenceId
    );
    if (exists) return;

    const newTx: XpTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      amount,
      sourceType,
      sourceReferenceId,
      description: descEn,
      descriptionAr: descAr,
      awardedAt: Date.now(),
    };

    setXpTransactions(prev => [newTx, ...prev]);

    setProfile(prev => {
      let currentXp = prev.currentXp + amount;
      let level = prev.level;
      let leveledUp = false;

      while (currentXp >= getXpRequiredForLevel(level)) {
        currentXp -= getXpRequiredForLevel(level);
        level += 1;
        leveledUp = true;
      }

      const rankTier = calculateRankTier(level);

      if (leveledUp) {
        soundEngine.playLevelUp();
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#42A5E8', '#9275FF', '#00E676'],
          });
        } catch {
          // Confetti fallback
        }
      }

      return {
        ...prev,
        currentXp,
        level,
        rankTier,
      };
    });
  };

  // Lesson Status Updater
  const updateLessonStatus = (lessonId: string, newStatus: LessonStatus) => {
    soundEngine.playClick();
    let completedLessonTitle = '';
    let completedLessonTitleAr = '';

    setSubjects(prev =>
      prev.map(subj => ({
        ...subj,
        chapters: subj.chapters.map(chap => ({
          ...chap,
          units: chap.units.map(unit => ({
            ...unit,
            lessons: unit.lessons.map(les => {
              if (les.id === lessonId) {
                if (newStatus === 'completed' && les.status !== 'completed') {
                  completedLessonTitle = les.title;
                  completedLessonTitleAr = les.titleAr;
                }
                return { ...les, status: newStatus, updatedAt: Date.now() };
              }
              return les;
            }),
          })),
        })),
      }))
    );

    if (completedLessonTitle) {
      awardXp(
        30,
        'LESSON_COMPLETION',
        lessonId,
        `Completed lesson: ${completedLessonTitle}`,
        `إكمال درس: ${completedLessonTitleAr}`
      );

      setProfile(prev => ({
        ...prev,
        completedLessonsCount: prev.completedLessonsCount + 1,
      }));

      // Update quest counter
      setQuests(prev =>
        prev.map(q =>
          q.actionType === 'lesson' && !q.isClaimed
            ? { ...q, currentCount: Math.min(q.targetCount, q.currentCount + 1) }
            : q
        )
      );
    }
  };

  // Add new Subject
  const addSubject = (newSubj: Omit<Subject, 'id' | 'createdAt' | 'isArchived' | 'chapters'>) => {
    soundEngine.playSuccess();
    const created: Subject = {
      ...newSubj,
      id: `subj_${Date.now()}`,
      createdAt: Date.now(),
      isArchived: false,
      chapters: [
        {
          id: `chap_${Date.now()}_1`,
          subjectId: `subj_${Date.now()}`,
          title: 'Chapter 1: Foundations',
          titleAr: 'الفصل 1: الأسس والمفاهيم الأولية',
          units: [
            {
              id: `unit_${Date.now()}_1`,
              chapterId: `chap_${Date.now()}_1`,
              title: 'Unit 1: Introduction',
              titleAr: 'الوحدة 1: المقدمة والتمهيد',
              lessons: [
                {
                  id: `les_${Date.now()}_1`,
                  unitId: `unit_${Date.now()}_1`,
                  title: 'Core Principles',
                  titleAr: 'المبادئ الأساسية',
                  status: 'not_started',
                  durationMinutes: 30,
                  updatedAt: Date.now(),
                },
              ],
            },
          ],
        },
      ],
    };
    setSubjects(prev => [created, ...prev]);
  };

  // Delete Subject
  const deleteSubject = (subjectId: string) => {
    soundEngine.playClick();
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setFlashcards(prev => prev.filter(f => f.subjectId !== subjectId));
  };

  // Add Lesson to Unit
  const addLessonToUnit = (unitId: string, titleEn: string, titleAr: string, durationMinutes: number = 30) => {
    soundEngine.playSuccess();
    const newLesson: Lesson = {
      id: `les_${Date.now()}`,
      unitId,
      title: titleEn,
      titleAr: titleAr,
      status: 'not_started',
      durationMinutes,
      updatedAt: Date.now(),
    };

    setSubjects(prev =>
      prev.map(subj => ({
        ...subj,
        chapters: subj.chapters.map(chap => ({
          ...chap,
          units: chap.units.map(unit => {
            if (unit.id === unitId) {
              return { ...unit, lessons: [...unit.lessons, newLesson] };
            }
            return unit;
          }),
        })),
      }))
    );
  };

  // SuperMemo SM-2 Spaced Repetition Engine
  // Quality rating: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
  const reviewFlashcard = (cardId: string, rating: 1 | 3 | 4 | 5) => {
    setFlashcards(prev =>
      prev.map(card => {
        if (card.id !== cardId) return card;

        let { repetition, intervalDays, easeFactor } = card;

        // Calculate new Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));

        if (rating < 3) {
          // Failed recall
          repetition = 0;
          intervalDays = 1;
        } else {
          // Successful recall
          if (repetition === 0) {
            intervalDays = 1;
          } else if (repetition === 1) {
            intervalDays = 3;
          } else {
            intervalDays = Math.round(intervalDays * easeFactor);
          }
          repetition += 1;
        }

        const nextReviewTimestamp = Date.now() + intervalDays * 24 * 60 * 60 * 1000;

        return {
          ...card,
          repetition,
          intervalDays,
          easeFactor: Number(easeFactor.toFixed(2)),
          nextReviewTimestamp,
          lastReviewedTimestamp: Date.now(),
          reviewCount: card.reviewCount + 1,
        };
      })
    );

    // Award XP
    awardXp(
      15,
      'FLASHCARD_REVIEW',
      `fc_rev_${cardId}_${Date.now()}`,
      'Reviewed flashcard via SM-2',
      'مراجعة بطاقة عبر خوارزمية التكرار المتباعد'
    );

    // Update quest
    setQuests(prev =>
      prev.map(q =>
        q.actionType === 'flashcard' && !q.isClaimed
          ? { ...q, currentCount: Math.min(q.targetCount, q.currentCount + 1) }
          : q
      )
    );
  };

  // Add Flashcard
  const addFlashcard = (front: string, back: string, frontAr?: string, backAr?: string, subjectId: string = 'subj_stem_calc') => {
    soundEngine.playSuccess();
    const newCard: Flashcard = {
      id: `fc_${Date.now()}`,
      subjectId,
      front,
      back,
      frontAr: frontAr || front,
      backAr: backAr || back,
      repetition: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewTimestamp: Date.now() + 24 * 60 * 60 * 1000,
      reviewCount: 0,
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  // Complete Focus Session
  const recordFocusSession = (durationMinutes: number, presetType: '25/5' | '50/10' | 'custom', subjectId?: string) => {
    const session: FocusSession = {
      id: `foc_${Date.now()}`,
      durationMinutes,
      presetType,
      subjectId,
      completedAt: Date.now(),
      earnedXp: 20,
    };

    setFocusSessions(prev => [session, ...prev]);
    setProfile(prev => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + durationMinutes,
    }));

    awardXp(
      20,
      'FOCUS_SESSION',
      session.id,
      `Completed ${durationMinutes}m focus session`,
      `إتمام جلسة تركيز مدتها ${durationMinutes} دقيقة`
    );

    // Update quest
    setQuests(prev =>
      prev.map(q =>
        q.actionType === 'focus' && !q.isClaimed
          ? { ...q, currentCount: Math.min(q.targetCount, q.currentCount + 1) }
          : q
      )
    );
  };

  // Solve Brain Challenge
  const recordBrainChallengeSolved = (puzzleId: string, xpReward: number, type: string) => {
    soundEngine.playSuccess();
    awardXp(
      xpReward,
      'BRAIN_GYM',
      `bg_${puzzleId}_${Date.now()}`,
      `Solved ${type} challenge in Brain Gym`,
      `حل لغز فكري في مختبر العقل (${type})`
    );

    // Update quest
    setQuests(prev =>
      prev.map(q =>
        q.actionType === 'puzzle' && !q.isClaimed
          ? { ...q, currentCount: Math.min(q.targetCount, q.currentCount + 1) }
          : q
      )
    );
  };

  // Claim Quest Reward
  const claimQuestReward = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest || targetQuest.isClaimed || targetQuest.currentCount < targetQuest.targetCount) return;

    soundEngine.playSuccess();
    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, isClaimed: true } : q))
    );

    awardXp(
      targetQuest.xpReward,
      'WEEKLY_GOAL',
      `quest_${questId}`,
      `Claimed quest reward: ${targetQuest.title}`,
      `استلام مكافأة المهمة: ${targetQuest.titleAr}`
    );
  };

  // Unlock Skill Node
  const unlockSkillNode = (nodeId: string) => {
    const node = skillNodes.find(n => n.id === nodeId);
    if (!node || node.unlocked) return;

    soundEngine.playSuccess();
    setSkillNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, unlocked: true } : n))
    );
  };

  // Export full backup JSON
  const exportBackupJson = () => {
    const payload = {
      profile,
      subjects,
      flashcards,
      focusSessions,
      skillNodes,
      quests,
      achievements,
      xpTransactions,
      exportedAt: new Date().toISOString(),
      appVersion: '2.0.0',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studylab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEngine.playSuccess();
  };

  // Import backup JSON
  const importBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.subjects) {
        throw new Error('Invalid backup schema');
      }
      setProfile(parsed.profile);
      setSubjects(parsed.subjects);
      if (parsed.flashcards) setFlashcards(parsed.flashcards);
      if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
      if (parsed.skillNodes) setSkillNodes(parsed.skillNodes);
      if (parsed.quests) setQuests(parsed.quests);
      if (parsed.achievements) setAchievements(parsed.achievements);
      if (parsed.xpTransactions) setXpTransactions(parsed.xpTransactions);
      soundEngine.playSuccess();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      soundEngine.playError();
      return false;
    }
  };

  // Reset to Factory Default Data
  const resetToFactoryDefaults = () => {
    soundEngine.playClick();
    setProfile(INITIAL_PROFILE);
    setSubjects(STARTER_SUBJECTS);
    setFlashcards(STARTER_FLASHCARDS);
    setFocusSessions([]);
    setSkillNodes(INITIAL_SKILL_NODES);
    setQuests(INITIAL_QUESTS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setXpTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    profile,
    subjects,
    flashcards,
    focusSessions,
    skillNodes,
    quests,
    achievements,
    xpTransactions,
    isLoaded,
    toggleLanguage,
    toggleSound,
    updateLessonStatus,
    addSubject,
    deleteSubject,
    addLessonToUnit,
    reviewFlashcard,
    addFlashcard,
    recordFocusSession,
    recordBrainChallengeSolved,
    claimQuestReward,
    unlockSkillNode,
    exportBackupJson,
    importBackupJson,
    resetToFactoryDefaults,
  };
}
