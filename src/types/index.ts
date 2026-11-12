export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';
export type PriorityLevel = 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Language = 'ar' | 'en';

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  titleAr: string;
  status: LessonStatus;
  notes?: string;
  durationMinutes: number;
  updatedAt: number;
}

export interface Unit {
  id: string;
  chapterId: string;
  title: string;
  titleAr: string;
  lessons: Lesson[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  titleAr: string;
  units: Unit[];
}

export interface Subject {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  icon: string;
  colorHex: string;
  priority: PriorityLevel;
  deadlineTimestamp?: number;
  isArchived: boolean;
  chapters: Chapter[];
  createdAt: number;
}

export interface Task {
  id: string;
  subjectId?: string;
  title: string;
  titleAr: string;
  isCompleted: boolean;
  dueDate: string;
  type: 'daily' | 'weekly';
}

export interface Flashcard {
  id: string;
  subjectId: string;
  subjectName?: string;
  front: string;
  frontAr?: string;
  back: string;
  backAr?: string;
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewTimestamp: number;
  lastReviewedTimestamp?: number;
  reviewCount: number;
}

export interface FocusSession {
  id: string;
  subjectId?: string;
  skillId?: string;
  subjectName?: string;
  durationMinutes: number;
  presetType: '25/5' | '50/10' | 'custom';
  completedAt: number;
  earnedXp: number;
}

export interface SkillNode {
  id: string;
  category: 'Mathematics' | 'Logical Thinking' | 'Programming' | 'English Language' | 'Problem Solving' | 'Research Skills' | 'Learning Techniques';
  categoryAr: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  tier: number; // 1 to 5
  requiredXp: number;
  unlocked: boolean;
  challenges: { id: string; title: string; titleAr: string; xpReward: number; completed: boolean }[];
}

export type PuzzleType = 'logic' | 'sequence' | 'math' | 'memory';

export interface BrainPuzzle {
  id: string;
  type: PuzzleType;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  promptAr: string;
  options: string[];
  optionsAr: string[];
  correctIndex: number;
  explanation: string;
  explanationAr: string;
  xpReward: number;
}

export interface XpTransaction {
  id: string;
  amount: number;
  sourceType: 'FOCUS_SESSION' | 'LESSON_COMPLETION' | 'QUIZ' | 'FLASHCARD_REVIEW' | 'BRAIN_GYM' | 'WEEKLY_GOAL';
  sourceReferenceId: string;
  description: string;
  descriptionAr: string;
  awardedAt: number;
}

export interface Quest {
  id: string;
  title: string;
  titleAr: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isClaimed: boolean;
  type: 'daily' | 'weekly';
  actionType: 'focus' | 'lesson' | 'flashcard' | 'puzzle';
}

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  currentXp: number;
  rankTier: RankTier;
  totalStudyMinutes: number;
  completedLessonsCount: number;
  preferredLanguage: Language;
  soundEnabled: boolean;
  streakDays: number;
  lastActiveDate: string;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  action: 'insert' | 'update' | 'delete';
  payload: string;
  timestamp: number;
  retryCount: number;
}
