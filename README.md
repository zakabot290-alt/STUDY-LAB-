# STUDY LAB — Offline-First Android Learning & RPG Progression Platform

STUDY LAB is an offline-first learning, cognitive training, and personal development platform designed for Android (optimized for the Infinix Smart 9, ARM 32-bit `armeabi-v7a` and 64-bit `arm64-v8a`) with an interactive live platform, procedural sound engine, and full Android Studio Kotlin/Compose project structure.

---

## Key Features

1. **Academic Study Center**: Organize subjects into chapters, units, and individual lessons with 4 completion statuses (`Not Started`, `In Progress`, `Completed`, `Needs Review`), priority badges, deadlines, and daily/weekly task management.
2. **Memory Engine (Spaced Repetition)**: Built on the SuperMemo SM-2 algorithm. Offers 3D interactive flashcard review sessions with 4 recall grading options (`Again`, `Hard`, `Good`, `Easy`) and retention metrics.
3. **Deep Focus Engine**: Pomodoro timer with 25/5, 50/10, and custom intervals, background reload survival, session linking, and synthesized ambient focus sound.
4. **Brain Gym**: Four interactive, playable cognitive games (Deductive Logic Puzzles, Number Sequences, Speed Mental Arithmetic, and Memory Pattern Grid) with validation and step-by-step explanations.
5. **RPG Progression & Skill Tree**: Deterministic Levels 1–100, Rank Tiers (E through S), daily/weekly quests, achievements, visual 7-category Skill Tree, and an immutable XP ledger with duplicate reward protection.
6. **Bilingual Localization**: Native Arabic (RTL, default) and English (LTR) with seamless direction flipping.
7. **Offline-First & Local Backup**: 100% offline functionality with versioned JSON backup export/import and an abstracted cloud sync queue.
8. **Dual Presentation Experience**: Toggle between an authentic Infinix Smart 9 Android device frame (with status bar, punch-hole camera, and gesture pill) and a full-screen responsive desktop/tablet layout.

---

## Visual Design Reference
- **Background**: `#08090D`
- **Primary Cards**: `#151720`
- **Secondary Cards**: `#202333`
- **Primary Blue Accent**: `#42A5E8`
- **Secondary Purple Accent**: `#9275FF`
- **Text Primary**: `#F5F6FA`
- **Text Secondary**: `#A0A5B5`

---

## Target Hardware Specifications
- **Device**: Infinix Smart 9 (Android 14 Go / XOS 14)
- **RAM Tier**: 3 GB – 4 GB RAM class (LMK threshold ~280 MB native memory)
- **Architecture**: ARM 32-bit (`armeabi-v7a`) & ARM 64-bit (`arm64-v8a`)
- **Graphics Pipeline**: Hardware-accelerated Skia rendering via Jetpack Compose / WebGL canvas
