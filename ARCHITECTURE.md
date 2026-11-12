# STUDY LAB — Architectural Blueprint

## 1. Clean Architecture & Unidirectional Data Flow

STUDY LAB is designed according to Clean Architecture principles, ensuring complete independence from UI frameworks, database engines, and network layers.

```
┌────────────────────────────────────────────────────────┐
│                      UI LAYER                          │
│  - Jetpack Compose Screens & Reusable Components       │
│  - StateFlow / Compose State Observers                │
│  - Device Frame & Presentation Viewport Layer          │
└───────────────────────────┬────────────────────────────┘
                            │ Dispatches User Actions
                            ▼
┌────────────────────────────────────────────────────────┐
│                   VIEWMODEL LAYER                      │
│  - UI State Reducers & StateFlow Emitters              │
│  - Input Validation & Coroutine Scopes                 │
└───────────────────────────┬────────────────────────────┘
                            │ Calls Use Cases
                            ▼
┌────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                        │
│  - Pure Kotlin Business Models & Invariants            │
│  - SuperMemo SM-2 Spaced Repetition Engine             │
│  - Level & Rank Calculator (Levels 1-100, Ranks E-S)   │
│  - XP Ledger Validation & Duplicate Protection         │
└───────────────────────────┬────────────────────────────┘
                            │ Accesses Repositories
                            ▼
┌────────────────────────────────────────────────────────┐
│                     DATA LAYER                         │
│  - Room Database (Local Source of Truth)               │
│  - DataStore Preferences (Language, Sound, Theme)      │
│  - Cloud Provider Abstraction (Sync Queue & Retries)   │
│  - JSON Backup / Restore Serializer                    │
└────────────────────────────────────────────────────────┘
```

## 2. SuperMemo SM-2 Spaced Repetition Engine

The Memory Engine calculates review intervals based on user recall ratings:

$$\text{Quality } q \in \{1: \text{Again}, 3: \text{Hard}, 4: \text{Good}, 5: \text{Easy}\}$$

1. **Ease Factor Update**:
   $$EF' = \max\left(1.3, EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)\right)$$
2. **Repetition Count & Interval**:
   - If $q < 3$ (failed recall): $n = 0$, $\text{Interval} = 1\text{ day}$.
   - If $n = 0$: $\text{Interval} = 1\text{ day}$, $n = 1$.
   - If $n = 1$: $\text{Interval} = 6\text{ days}$, $n = 2$.
   - If $n \ge 2$: $\text{Interval} = \text{round}(\text{Previous Interval} \times EF')$, $n = n + 1$.

## 3. RPG Progression & XP Formula

- **Level Progression**:
  $$\text{XP Required for Level } L = 100 \times L^{1.3}$$
- **Rank Tiers**:
  - Rank E: Levels 1–10
  - Rank D: Levels 11–20
  - Rank C: Levels 21–35
  - Rank B: Levels 36–50
  - Rank A: Levels 51–75
  - Rank S: Levels 76–100
- **Immutable Transaction Rule**:
  Every XP award is logged as a unique `XpTransaction(sourceType, sourceReferenceId)`. The compound key prevents duplicate awards. XP is strictly additive—never deducted for inactivity.
