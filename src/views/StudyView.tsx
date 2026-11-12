import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import { useStudyLabStore } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { LessonStatus, PriorityLevel } from '../types';
import { StudyCard } from '../components/StudyCard';
import { StudyProgressBar } from '../components/StudyProgressBar';
import { STARTER_SUBJECTS } from '../lib/templates';
import { soundEngine } from '../lib/soundEngine';

export const StudyView: React.FC = () => {
  const {
    profile,
    subjects,
    updateLessonStatus,
    addSubject,
    deleteSubject,
    addLessonToUnit,
  } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState<string | null>(null); // holds unitId

  // Form states for new subject
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjNameAr, setNewSubjNameAr] = useState('');
  const [newSubjDesc, setNewSubjDesc] = useState('');
  const [newSubjDescAr, setNewSubjDescAr] = useState('');
  const [newSubjPriority, setNewSubjPriority] = useState<PriorityLevel>(2);
  const [newSubjColor, setNewSubjColor] = useState('#42A5E8');

  // Form states for new lesson
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonTitleAr, setNewLessonTitleAr] = useState('');

  // Expanded chapter accordions
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    chap_calc_1: true,
    chap_cs_1: true,
    chap_lang_1: true,
  });

  const toggleChapter = (chapId: string) => {
    soundEngine.playClick();
    setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    addSubject({
      name: newSubjName.trim(),
      nameAr: newSubjNameAr.trim() || newSubjName.trim(),
      description: newSubjDesc.trim() || 'Custom academic course',
      descriptionAr: newSubjDescAr.trim() || newSubjDesc.trim() || 'دورة أكاديمية مخصصة',
      category: 'General',
      categoryAr: 'عام',
      icon: 'BookOpen',
      colorHex: newSubjColor,
      priority: newSubjPriority,
      deadlineTimestamp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    setNewSubjName('');
    setNewSubjNameAr('');
    setNewSubjDesc('');
    setNewSubjDescAr('');
    setShowAddSubjectModal(false);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLessonModal || !newLessonTitle.trim()) return;

    addLessonToUnit(
      showAddLessonModal,
      newLessonTitle.trim(),
      newLessonTitleAr.trim() || newLessonTitle.trim(),
      30
    );

    setNewLessonTitle('');
    setNewLessonTitleAr('');
    setShowAddLessonModal(null);
  };

  const handleImportTemplate = (templateIndex: number) => {
    const template = STARTER_SUBJECTS[templateIndex];
    if (template) {
      addSubject({
        name: template.name,
        nameAr: template.nameAr,
        description: template.description,
        descriptionAr: template.descriptionAr,
        category: template.category,
        categoryAr: template.categoryAr,
        icon: template.icon,
        colorHex: template.colorHex,
        priority: template.priority,
        deadlineTimestamp: template.deadlineTimestamp,
      });
      setShowTemplateModal(false);
    }
  };

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />,
          text: t.statusCompleted,
          bg: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
        };
      case 'in_progress':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-[#42A5E8]" />,
          text: t.statusInProgress,
          bg: 'bg-[#42A5E8]/10 text-[#42A5E8] border-[#42A5E8]/30',
        };
      case 'needs_review':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-[#FFAB40]" />,
          text: t.statusNeedsReview,
          bg: 'bg-[#FFAB40]/10 text-[#FFAB40] border-[#FFAB40]/30',
        };
      default:
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-[#A0A5B5]" />,
          text: t.statusNotStarted,
          bg: 'bg-[#202333] text-[#A0A5B5] border-[#2c3247]',
        };
    }
  };

  const cycleStatus = (current: LessonStatus): LessonStatus => {
    if (current === 'not_started') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    if (current === 'completed') return 'needs_review';
    return 'not_started';
  };

  return (
    <div className="flex flex-col p-4 space-y-4 pb-24">
      {/* 1. Header & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-[#F5F6FA]">
            {t.studyCenterTitle}
          </h1>
          <span className="text-[11px] text-[#A0A5B5]">
            {subjects.length} {t.myClasses}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowTemplateModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-medium text-[#A0A5B5] hover:text-[#F5F6FA] transition-colors"
            title="Import curriculum templates"
          >
            <Download className="w-3.5 h-3.5 text-[#9275FF]" />
            <span className="hidden sm:inline">{t.importTemplates}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setShowAddSubjectModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#42A5E8] hover:bg-[#3894d1] text-[#08090D] text-xs font-bold shadow-md shadow-[#42A5E8]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addSubject}</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Subject Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map(subject => {
          const isSelected = subject.id === selectedSubjectId;
          const allLessons = subject.chapters.flatMap(c => c.units.flatMap(u => u.lessons));
          const completedCount = allLessons.filter(l => l.status === 'completed').length;
          const progress = allLessons.length > 0 ? completedCount / allLessons.length : 0;

          return (
            <button
              key={subject.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedSubjectId(subject.id);
              }}
              className={`
                flex-shrink-0 min-w-[150px] p-2.5 rounded-xl border text-start transition-all
                ${
                  isSelected
                    ? 'bg-[#151720] border-[#42A5E8] shadow-lg shadow-[#42A5E8]/10'
                    : 'bg-[#151720]/60 border-[#202333] hover:border-[#2c3247]'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: subject.colorHex }}
                />
                <span className="text-xs font-bold text-[#F5F6FA] truncate">
                  {profile.preferredLanguage === 'ar' ? subject.nameAr : subject.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#A0A5B5] mb-1.5">
                <span>{completedCount}/{allLessons.length}</span>
                <span className="font-mono">{Math.round(progress * 100)}%</span>
              </div>
              <StudyProgressBar progress={progress} color="bg-[#42A5E8]" height="h-1" />
            </button>
          );
        })}
      </div>

      {/* 3. Selected Subject Detail Header */}
      {activeSubject && (
        <StudyCard className="p-3.5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeSubject.colorHex }}
                />
                <h2 className="text-sm font-bold text-[#F5F6FA]">
                  {profile.preferredLanguage === 'ar' ? activeSubject.nameAr : activeSubject.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202333] text-[#A0A5B5] font-mono border border-[#2c3247]">
                  {activeSubject.category}
                </span>
              </div>
              <p className="text-xs text-[#A0A5B5] mt-1 line-clamp-2">
                {profile.preferredLanguage === 'ar' ? activeSubject.descriptionAr : activeSubject.description}
              </p>
            </div>

            {subjects.length > 1 && (
              <button
                onClick={() => deleteSubject(activeSubject.id)}
                className="p-1.5 rounded-lg text-[#A0A5B5] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-colors"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </StudyCard>
      )}

      {/* 4. Chapters, Units & Lessons Tree */}
      {activeSubject && (
        <div className="space-y-3">
          {activeSubject.chapters.map(chapter => {
            const isChapterExpanded = expandedChapters[chapter.id] !== false;
            const chapLessons = chapter.units.flatMap(u => u.lessons);
            const chapCompleted = chapLessons.filter(l => l.status === 'completed').length;

            return (
              <div
                key={chapter.id}
                className="rounded-2xl border border-[#202333] bg-[#151720] overflow-hidden"
              >
                {/* Chapter Accordion Bar */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full px-4 py-3 bg-[#151720] hover:bg-[#1a1d28] flex items-center justify-between text-start transition-colors border-b border-[#202333]/50"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#42A5E8]" />
                    <span className="text-xs font-bold text-[#F5F6FA]">
                      {profile.preferredLanguage === 'ar' ? chapter.titleAr : chapter.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#A0A5B5]">
                      ({chapCompleted}/{chapLessons.length})
                    </span>
                  </div>
                  {isChapterExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#A0A5B5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A0A5B5]" />
                  )}
                </button>

                {/* Chapter Body */}
                {isChapterExpanded && (
                  <div className="p-3 space-y-3">
                    {chapter.units.map(unit => (
                      <div key={unit.id} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-semibold text-[#A0A5B5]">
                            {profile.preferredLanguage === 'ar' ? unit.titleAr : unit.title}
                          </span>
                          <button
                            onClick={() => setShowAddLessonModal(unit.id)}
                            className="text-[10px] text-[#42A5E8] hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{t.addLesson}</span>
                          </button>
                        </div>

                        {/* Lesson Items */}
                        <div className="space-y-1.5">
                          {unit.lessons.map(lesson => {
                            const badge = getStatusBadge(lesson.status);

                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#202333]/60 hover:bg-[#202333] border border-[#2c3247]/50 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1 pr-2">
                                  <span className="text-xs font-medium text-[#F5F6FA] line-clamp-1">
                                    {profile.preferredLanguage === 'ar' ? lesson.titleAr : lesson.title}
                                  </span>
                                </div>

                                {/* Clickable Status Badge to cycle through states */}
                                <button
                                  onClick={() => updateLessonStatus(lesson.id, cycleStatus(lesson.status))}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all active:scale-95 ${badge.bg}`}
                                  title="Click to toggle lesson status"
                                >
                                  {badge.icon}
                                  <span>{badge.text}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add New Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151720] border border-[#202333] p-4 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F5F6FA]">{t.addSubject}</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.subjectName} (English)</label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={e => setNewSubjName(e.target.value)}
                  placeholder="e.g. Modern Physics"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl px-3 py-2 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.subjectName} (العربية)</label>
                <input
                  type="text"
                  value={newSubjNameAr}
                  onChange={e => setNewSubjNameAr(e.target.value)}
                  placeholder="مثال: الفيزياء الحديثة"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl px-3 py-2 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.color}</label>
                <div className="flex items-center gap-2">
                  {['#42A5E8', '#9275FF', '#00E676', '#FFAB40', '#FF5252'].map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewSubjColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${newSubjColor === color ? 'scale-110 border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#A0A5B5] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#42A5E8] text-[#08090D] font-bold text-xs"
                >
                  {t.saveSubject}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Curriculum Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151720] border border-[#202333] p-4 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F5F6FA]">{t.templatesTitle}</h3>
            <p className="text-xs text-[#A0A5B5]">
              Choose a preloaded curriculum package to install into your active syllabus.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleImportTemplate(0)}
                className="w-full p-3 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-start flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#42A5E8] block">{t.templateStem}</span>
                  <span className="text-[10px] text-[#A0A5B5]">Limits, Integrals, and Differential Equations</span>
                </div>
                <Plus className="w-4 h-4 text-[#42A5E8]" />
              </button>

              <button
                onClick={() => handleImportTemplate(1)}
                className="w-full p-3 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-start flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#9275FF] block">{t.templateCs}</span>
                  <span className="text-[10px] text-[#A0A5B5]">Big-O, Sorting, Graphs, and Dynamic Programming</span>
                </div>
                <Plus className="w-4 h-4 text-[#9275FF]" />
              </button>

              <button
                onClick={() => handleImportTemplate(2)}
                className="w-full p-3 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-start flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#00E676] block">{t.templateLang}</span>
                  <span className="text-[10px] text-[#A0A5B5]">Rhetorical Tropes, Syntax, and Advanced Lexicon</span>
                </div>
                <Plus className="w-4 h-4 text-[#00E676]" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#A0A5B5] hover:text-white"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Lesson Modal */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151720] border border-[#202333] p-4 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F5F6FA]">{t.addLesson}</h3>
            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.lessonTitle} (English)</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Fundamental Theorem Proof"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl px-3 py-2 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.lessonTitle} (العربية)</label>
                <input
                  type="text"
                  value={newLessonTitleAr}
                  onChange={e => setNewLessonTitleAr(e.target.value)}
                  placeholder="مثال: برهان النظرية الأساسية"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl px-3 py-2 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#A0A5B5] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#42A5E8] text-[#08090D] font-bold text-xs"
                >
                  {t.addLesson}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
