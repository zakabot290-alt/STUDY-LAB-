import React, { useState } from 'react';
import {
  Layers,
  Brain,
  RotateCw,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useStudyLabStore } from '../store/useStudyLabStore';
import { getTranslation } from '../lib/i18n';
import { StudyCard } from '../components/StudyCard';
import { BRAIN_PUZZLES } from '../lib/puzzles';
import { soundEngine } from '../lib/soundEngine';

export const BrainView: React.FC = () => {
  const {
    profile,
    flashcards,
    reviewFlashcard,
    addFlashcard,
    recordBrainChallengeSolved,
  } = useStudyLabStore();
  const t = getTranslation(profile.preferredLanguage);

  const [activeTab, setActiveTab] = useState<'memory' | 'gym'>('memory');

  // Flashcard review state
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);

  // New card form
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newFrontAr, setNewFrontAr] = useState('');
  const [newBackAr, setNewBackAr] = useState('');

  // Brain Gym puzzle state
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Visual Memory Matrix Mini-Game State
  const [matrixActive, setMatrixActive] = useState<boolean>(false);
  const [highlightedTiles, setHighlightedTiles] = useState<number[]>([]);
  const [userSelectedTiles, setUserSelectedTiles] = useState<number[]>([]);
  const [matrixStatus, setMatrixStatus] = useState<'idle' | 'memorizing' | 'recalling' | 'success' | 'failed'>('idle');

  // Filter flashcards due for review
  const now = Date.now();
  const dueCards = flashcards.filter(c => c.nextReviewTimestamp <= now);
  const currentCard = dueCards[reviewIndex] || flashcards[reviewIndex % flashcards.length];

  const handleFlipCard = () => {
    soundEngine.playClick();
    setIsFlipped(prev => !prev);
  };

  const handleGradeCard = (rating: 1 | 3 | 4 | 5) => {
    if (!currentCard) return;
    reviewFlashcard(currentCard.id, rating);
    setIsFlipped(false);
    if (reviewIndex < dueCards.length - 1) {
      setReviewIndex(prev => prev + 1);
    } else {
      setReviewIndex(0);
    }
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    addFlashcard(newFront.trim(), newBack.trim(), newFrontAr.trim(), newBackAr.trim());
    setNewFront('');
    setNewBack('');
    setNewFrontAr('');
    setNewBackAr('');
    setShowAddCardModal(false);
  };

  // Puzzle handlers
  const currentPuzzle = BRAIN_PUZZLES[puzzleIndex % BRAIN_PUZZLES.length];

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    soundEngine.playClick();
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;
    setHasSubmitted(true);
    const correct = selectedOption === currentPuzzle.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      soundEngine.playSuccess();
      recordBrainChallengeSolved(currentPuzzle.id, currentPuzzle.xpReward, currentPuzzle.type);
    } else {
      soundEngine.playError();
    }
  };

  const handleNextPuzzle = () => {
    soundEngine.playClick();
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
    setPuzzleIndex(prev => (prev + 1) % BRAIN_PUZZLES.length);
  };

  // Memory Matrix Game (4x4 Grid = 16 tiles)
  const startMemoryMatrix = () => {
    soundEngine.playClick();
    // Choose 4 random unique tile indices from 0 to 15
    const tiles: number[] = [];
    while (tiles.length < 4) {
      const rand = Math.floor(Math.random() * 16);
      if (!tiles.includes(rand)) tiles.push(rand);
    }
    setHighlightedTiles(tiles);
    setUserSelectedTiles([]);
    setMatrixActive(true);
    setMatrixStatus('memorizing');

    // Display pattern for 2.2 seconds, then hide and let user recall
    setTimeout(() => {
      setMatrixStatus('recalling');
    }, 2200);
  };

  const handleTileClick = (index: number) => {
    if (matrixStatus !== 'recalling') return;
    soundEngine.playClick();

    if (userSelectedTiles.includes(index)) return;
    const newSelected = [...userSelectedTiles, index];
    setUserSelectedTiles(newSelected);

    // If user clicked a wrong tile
    if (!highlightedTiles.includes(index)) {
      setMatrixStatus('failed');
      soundEngine.playError();
      return;
    }

    // If user found all correct tiles
    if (newSelected.length === highlightedTiles.length) {
      setMatrixStatus('success');
      soundEngine.playSuccess();
      recordBrainChallengeSolved(`matrix_${Date.now()}`, 25, 'Visual Memory');
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4 pb-24">
      {/* 1. Sub-Tab Segmented Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#F5F6FA]">{t.brainHubTitle}</h1>
      </div>

      <div className="flex items-center p-1 bg-[#151720] border border-[#202333] rounded-2xl">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('memory');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'memory'
              ? 'bg-[#202333] text-[#42A5E8] shadow-md border border-[#42A5E8]/30'
              : 'text-[#A0A5B5] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.tabMemory}</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('gym');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'gym'
              ? 'bg-[#202333] text-[#9275FF] shadow-md border border-[#9275FF]/30'
              : 'text-[#A0A5B5] hover:text-white'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>{t.tabGym}</span>
        </button>
      </div>

      {/* 2. TAB A: MEMORY ENGINE (SM-2 Spaced Repetition) */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          {/* Deck Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <StudyCard className="p-2.5 text-center">
              <span className="text-[10px] text-[#A0A5B5] block">{t.flashcardsCount}</span>
              <span className="text-sm font-bold font-mono text-[#F5F6FA]">{flashcards.length}</span>
            </StudyCard>

            <StudyCard className="p-2.5 text-center border-[#42A5E8]/40">
              <span className="text-[10px] text-[#42A5E8] block">{t.dueForReview}</span>
              <span className="text-sm font-bold font-mono text-[#42A5E8]">{dueCards.length}</span>
            </StudyCard>

            <StudyCard className="p-2.5 text-center">
              <span className="text-[10px] text-[#00E676] block">{t.masteredCards}</span>
              <span className="text-sm font-bold font-mono text-[#00E676]">
                {flashcards.filter(c => c.repetition >= 3).length}
              </span>
            </StudyCard>
          </div>

          {/* Interactive 3D Flip Flashcard */}
          {currentCard ? (
            <div className="space-y-3">
              <div
                onClick={handleFlipCard}
                className="perspective-1000 min-h-[220px] w-full cursor-pointer select-none"
              >
                <div
                  className={`relative w-full h-full min-h-[220px] rounded-2xl border transition-transform duration-500 transform-style-3d ${
                    isFlipped
                      ? 'rotate-y-180 bg-gradient-to-br from-[#1c2236] to-[#151720] border-[#9275FF]/50 shadow-xl shadow-[#9275FF]/10'
                      : 'bg-gradient-to-br from-[#151720] to-[#1d2130] border-[#202333] shadow-lg'
                  }`}
                >
                  {/* Front Side */}
                  <div
                    className={`absolute inset-0 p-5 flex flex-col justify-between backface-hidden ${
                      isFlipped ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#A0A5B5]">
                      <span className="font-semibold text-[#42A5E8]">
                        {currentCard.subjectName || 'Study Subject'}
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-[#A0A5B5]" />
                        {t.tapToFlip}
                      </span>
                    </div>

                    <div className="my-auto text-center px-2">
                      <span className="text-[10px] text-[#A0A5B5] uppercase tracking-wider block mb-1">
                        {t.questionSide}
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-[#F5F6FA] leading-relaxed">
                        {profile.preferredLanguage === 'ar' && currentCard.frontAr
                          ? currentCard.frontAr
                          : currentCard.front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#A0A5B5] font-mono">
                      <span>Rep: #{currentCard.repetition}</span>
                      <span>EF: {currentCard.easeFactor}</span>
                    </div>
                  </div>

                  {/* Back Side (Answer) */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between rotate-y-180 backface-hidden">
                    <div className="flex items-center justify-between text-[11px] text-[#A0A5B5]">
                      <span className="font-semibold text-[#9275FF]">
                        {t.answerSide}
                      </span>
                      <span className="text-[10px] font-mono text-[#00E676]">
                        Interval: {currentCard.intervalDays}d
                      </span>
                    </div>

                    <div className="my-auto text-center px-2">
                      <p className="text-xs sm:text-sm text-[#F5F6FA] leading-relaxed">
                        {profile.preferredLanguage === 'ar' && currentCard.backAr
                          ? currentCard.backAr
                          : currentCard.back}
                      </p>
                    </div>

                    <div className="text-center text-[10px] text-[#A0A5B5]">
                      Select your recall quality below to update SM-2 schedule
                    </div>
                  </div>
                </div>
              </div>

              {/* SM-2 Recall Rating Action Strip */}
              {isFlipped ? (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleGradeCard(1)}
                    className="p-2 rounded-xl bg-[#FF5252]/10 hover:bg-[#FF5252]/20 border border-[#FF5252]/40 text-[#FF5252] text-center transition-all active:scale-95"
                  >
                    <span className="text-[11px] font-bold block">{t.ratingAgain}</span>
                  </button>

                  <button
                    onClick={() => handleGradeCard(3)}
                    className="p-2 rounded-xl bg-[#FFAB40]/10 hover:bg-[#FFAB40]/20 border border-[#FFAB40]/40 text-[#FFAB40] text-center transition-all active:scale-95"
                  >
                    <span className="text-[11px] font-bold block">{t.ratingHard}</span>
                  </button>

                  <button
                    onClick={() => handleGradeCard(4)}
                    className="p-2 rounded-xl bg-[#42A5E8]/10 hover:bg-[#42A5E8]/20 border border-[#42A5E8]/40 text-[#42A5E8] text-center transition-all active:scale-95"
                  >
                    <span className="text-[11px] font-bold block">{t.ratingGood}</span>
                  </button>

                  <button
                    onClick={() => handleGradeCard(5)}
                    className="p-2 rounded-xl bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-center transition-all active:scale-95"
                  >
                    <span className="text-[11px] font-bold block">{t.ratingEasy}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFlipCard}
                  className="w-full py-2.5 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-semibold text-[#42A5E8] transition-colors"
                >
                  {t.tapToFlip}
                </button>
              )}
            </div>
          ) : (
            <StudyCard className="p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#00E676] mx-auto mb-2" />
              <p className="text-xs text-[#F5F6FA] font-semibold">{t.allReviewed}</p>
            </StudyCard>
          )}

          {/* Add New Flashcard Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowAddCardModal(true);
              }}
              className="w-full py-2 rounded-xl bg-[#151720] hover:bg-[#202333] border border-[#202333] text-xs font-medium text-[#A0A5B5] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#42A5E8]" />
              <span>{t.createNewCard}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TAB B: BRAIN GYM (Interactive Mental Exercises) */}
      {activeTab === 'gym' && (
        <div className="space-y-4">
          {/* Active Logic / Math Challenge Card */}
          <StudyCard className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-[#9275FF]/10 text-[#9275FF] border border-[#9275FF]/30 font-semibold text-[10px]">
                {currentPuzzle.type.toUpperCase()} · {currentPuzzle.difficulty}
              </span>
              <span className="font-mono text-[#00E676] text-[11px]">
                +{currentPuzzle.xpReward} XP
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#F5F6FA] leading-relaxed">
              {profile.preferredLanguage === 'ar' ? currentPuzzle.promptAr : currentPuzzle.prompt}
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2 pt-1">
              {(profile.preferredLanguage === 'ar' ? currentPuzzle.optionsAr : currentPuzzle.options).map(
                (opt, index) => {
                  let btnStyle = 'bg-[#202333]/80 border-[#2c3247] text-[#F5F6FA]';

                  if (hasSubmitted) {
                    if (index === currentPuzzle.correctIndex) {
                      btnStyle = 'bg-[#00E676]/20 border-[#00E676] text-[#00E676] font-bold';
                    } else if (index === selectedOption) {
                      btnStyle = 'bg-[#FF5252]/20 border-[#FF5252] text-[#FF5252]';
                    }
                  } else if (selectedOption === index) {
                    btnStyle = 'bg-[#42A5E8]/20 border-[#42A5E8] text-[#42A5E8] font-bold shadow-md';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={hasSubmitted}
                      className={`w-full p-2.5 rounded-xl border text-start text-xs transition-all active:scale-[0.99] flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasSubmitted && index === currentPuzzle.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                      )}
                      {hasSubmitted && index === selectedOption && index !== currentPuzzle.correctIndex && (
                        <XCircle className="w-4 h-4 text-[#FF5252]" />
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* Feedback & Step-by-Step Explanation */}
            {hasSubmitted && (
              <div
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  isCorrect
                    ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]'
                    : 'bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252]'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {isCorrect ? <Sparkles className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{isCorrect ? t.correctAnswer : t.incorrectAnswer}</span>
                </div>
                <p className="text-[11px] text-[#A0A5B5] mt-1 text-start">
                  <strong>{t.explanationTitle}</strong>{' '}
                  {profile.preferredLanguage === 'ar' ? currentPuzzle.explanationAr : currentPuzzle.explanation}
                </p>
              </div>
            )}

            {/* Check / Next Button */}
            <div className="pt-2">
              {!hasSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="w-full py-2.5 rounded-xl bg-[#42A5E8] hover:bg-[#3894d1] disabled:opacity-40 text-[#08090D] font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {t.checkAnswer}
                </button>
              ) : (
                <button
                  onClick={handleNextPuzzle}
                  className="w-full py-2.5 rounded-xl bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-xs font-bold text-[#F5F6FA] transition-colors"
                >
                  {t.nextPuzzle}
                </button>
              )}
            </div>
          </StudyCard>

          {/* 4x4 Visual Memory Sequence Matrix Game */}
          <StudyCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#F5F6FA]">{t.puzzleMemory}</h3>
                <span className="text-[10px] text-[#A0A5B5]">4x4 Pattern Recall</span>
              </div>
              <button
                onClick={startMemoryMatrix}
                className="px-3 py-1 rounded-xl bg-[#9275FF] hover:bg-[#8363fc] text-[#08090D] text-xs font-bold transition-all active:scale-95"
              >
                {t.startMatrixTest}
              </button>
            </div>

            {matrixActive && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] text-[#A0A5B5] block text-center">
                  {matrixStatus === 'memorizing' && t.memorizePattern}
                  {matrixStatus === 'recalling' && t.reproducePattern}
                  {matrixStatus === 'success' && '🌟 Brilliant! Pattern memorized perfectly! +25 XP'}
                  {matrixStatus === 'failed' && '❌ Incorrect tile. Tap Start to try another pattern.'}
                </span>

                {/* 4x4 Grid Matrix */}
                <div className="grid grid-cols-4 gap-2 max-w-[240px] mx-auto">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const isLit = matrixStatus === 'memorizing' && highlightedTiles.includes(i);
                    const isSelected = userSelectedTiles.includes(i);
                    const isTarget = highlightedTiles.includes(i);

                    let tileColor = 'bg-[#202333] border-[#2c3247]';
                    if (isLit) {
                      tileColor = 'bg-[#42A5E8] border-[#42A5E8] shadow-lg shadow-[#42A5E8]/50';
                    } else if (matrixStatus === 'success' && isTarget) {
                      tileColor = 'bg-[#00E676] border-[#00E676]';
                    } else if (isSelected) {
                      tileColor = isTarget ? 'bg-[#00E676] border-[#00E676]' : 'bg-[#FF5252] border-[#FF5252]';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleTileClick(i)}
                        disabled={matrixStatus !== 'recalling'}
                        className={`h-11 rounded-xl border transition-all active:scale-95 ${tileColor}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </StudyCard>
        </div>
      )}

      {/* MODAL: Create New Flashcard */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151720] border border-[#202333] p-4 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F5F6FA]">{t.createNewCard}</h3>
            <form onSubmit={handleAddCardSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.frontSide} (Question)</label>
                <textarea
                  required
                  rows={2}
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="e.g. What is L'Hopital's Rule?"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl p-2.5 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0A5B5] block mb-1">{t.backSide} (Answer)</label>
                <textarea
                  required
                  rows={2}
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="e.g. If limit is 0/0 or inf/inf, lim f/g = lim f'/g'"
                  className="w-full bg-[#202333] border border-[#2c3247] rounded-xl p-2.5 text-xs text-[#F5F6FA] focus:outline-none focus:border-[#42A5E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#A0A5B5] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#42A5E8] text-[#08090D] font-bold text-xs"
                >
                  {t.saveCard}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
