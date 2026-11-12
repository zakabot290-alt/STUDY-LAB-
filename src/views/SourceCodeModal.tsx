import React, { useState } from 'react';
import { X, Copy, Check, FileCode, FolderTree, Package, Terminal, Download } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';
import { exportCompleteAndroidProjectZip } from '../lib/projectExporter';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANDROID_FILES: Record<string, { lang: string; code: string; desc: string }> = {
  'MainActivity.kt': {
    lang: 'kotlin',
    desc: 'Jetpack Compose entry point with dark system bar edge-to-edge support & Scaffold navigation.',
    code: `package com.studylab.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.studylab.app.core.designsystem.StudyLabTheme
import com.studylab.app.navigation.StudyLabBottomBar
import com.studylab.app.navigation.StudyLabNavGraph
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StudyLabTheme {
                val navController = rememberNavController()
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        StudyLabBottomBar(navController = navController)
                    }
                ) { innerPadding ->
                    StudyLabNavGraph(
                        navController = navController,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}`,
  },
  'StudyLabDatabase.kt': {
    lang: 'kotlin',
    desc: 'Room SQLite database with WAL caching, immutable transaction indices, and foreign keys.',
    code: `package com.studylab.app.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.studylab.app.core.database.dao.SubjectDao
import com.studylab.app.core.database.dao.FlashcardDao
import com.studylab.app.core.database.dao.XpTransactionDao
import com.studylab.app.core.model.UserProfileEntity
import com.studylab.app.core.model.SubjectEntity
import com.studylab.app.core.model.ChapterEntity
import com.studylab.app.core.model.UnitEntity
import com.studylab.app.core.model.LessonEntity
import com.studylab.app.core.model.FlashcardEntity
import com.studylab.app.core.model.FocusSessionEntity
import com.studylab.app.core.model.XpTransactionEntity

@Database(
    entities = [
        UserProfileEntity::class,
        SubjectEntity::class,
        ChapterEntity::class,
        UnitEntity::class,
        LessonEntity::class,
        FlashcardEntity::class,
        FocusSessionEntity::class,
        XpTransactionEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class StudyLabDatabase : RoomDatabase() {
    abstract fun subjectDao(): SubjectDao
    abstract fun flashcardDao(): FlashcardDao
    abstract fun xpTransactionDao(): XpTransactionDao
}`,
  },
  'XpTransactionEntity.kt': {
    lang: 'kotlin',
    desc: 'Room Entity enforcing immutable compound index (sourceType + sourceReferenceId) to prevent duplicate XP.',
    code: `package com.studylab.app.core.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "xp_transactions",
    indices = [
        Index(value = ["sourceType", "sourceReferenceId"], unique = true)
    ]
)
data class XpTransactionEntity(
    @PrimaryKey
    val id: String,
    val amount: Int,
    val sourceType: String, // FOCUS_SESSION, LESSON_COMPLETION, QUIZ, FLASHCARD_REVIEW, BRAIN_GYM
    val sourceReferenceId: String,
    val description: String,
    val descriptionAr: String,
    val awardedAt: Long = System.currentTimeMillis()
)`,
  },
  'SpacedRepetitionSM2.kt': {
    lang: 'kotlin',
    desc: 'Pure Kotlin implementation of the SuperMemo SM-2 spaced repetition review algorithm.',
    code: `package com.studylab.app.core.domain

import kotlin.math.max
import kotlin.math.roundToInt

data class ReviewResult(
    val repetition: Int,
    val intervalDays: Int,
    val easeFactor: Double,
    val nextReviewTimestamp: Long
)

object SpacedRepetitionSM2 {
    fun calculateNextReview(
        currentRepetition: Int,
        currentIntervalDays: Int,
        currentEaseFactor: Double,
        rating: Int // 1: Again, 3: Hard, 4: Good, 5: Easy
    ): ReviewResult {
        var repetition = currentRepetition
        var intervalDays = currentIntervalDays
        
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        val newEaseFactor = max(
            1.3,
            currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
        )

        if (rating < 3) {
            repetition = 0
            intervalDays = 1
        } else {
            intervalDays = when (repetition) {
                0 -> 1
                1 -> 3
                else -> (intervalDays * newEaseFactor).roundToInt()
            }
            repetition += 1
        }

        val nextReview = System.currentTimeMillis() + (intervalDays * 24L * 60L * 60L * 1000L)

        return ReviewResult(
            repetition = repetition,
            intervalDays = intervalDays,
            easeFactor = (newEaseFactor * 100.0).roundToInt() / 100.0,
            nextReviewTimestamp = nextReview
        )
    }
}`,
  },
  'app/build.gradle.kts': {
    lang: 'kotlin',
    desc: 'Gradle build configuration strictly locking ABI filters to armeabi-v7a (32-bit) and arm64-v8a.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.dagger.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.studylab.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.studylab.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 10001
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        ndk {
            // Strict 32-bit (armeabi-v7a) & 64-bit ARM hardware ABI filter
            abiFilters.addAll(setOf("armeabi-v7a", "arm64-v8a"))
        }

        ksp {
            arg("room.schemaLocation", "$projectDir/schemas")
            arg("room.incremental", "true")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}`,
  },
};

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFileData = ANDROID_FILES[selectedFile];

  const handleCopy = () => {
    soundEngine.playClick();
    if (currentFileData) {
      navigator.clipboard.writeText(currentFileData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] max-h-[85vh] rounded-3xl bg-[#0d0f17] border border-[#202333] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#151720] border-b border-[#202333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#42A5E8]/10 text-[#42A5E8]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F6FA]">
                STUDY LAB — Android Studio Kotlin Project
              </h2>
              <span className="text-[11px] text-[#A0A5B5]">
                Infinix Smart 9 · armeabi-v7a & arm64-v8a · Room DB + Jetpack Compose
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCompleteAndroidProjectZip()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#42A5E8] to-[#9275FF] hover:brightness-110 text-xs font-bold text-[#08090D] shadow-md shadow-[#42A5E8]/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#08090D]" />
              <span>Download Project (.zip)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-[#202333] hover:bg-[#282d42] text-[#A0A5B5] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left File Tree & Right Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-64 bg-[#11131c] border-b md:border-b-0 md:border-r border-[#202333] p-3 overflow-y-auto space-y-1 shrink-0">
            <span className="text-[10px] text-[#A0A5B5] font-semibold uppercase tracking-wider block px-2 mb-2 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-[#42A5E8]" />
              Project Files
            </span>

            {Object.keys(ANDROID_FILES).map(fileName => (
              <button
                key={fileName}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedFile(fileName);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono text-start flex items-center gap-2 transition-colors ${
                  selectedFile === fileName
                    ? 'bg-[#202333] text-[#42A5E8] font-bold border border-[#42A5E8]/30'
                    : 'text-[#A0A5B5] hover:text-white hover:bg-[#151720]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}

            <div className="pt-3 px-2 text-[10px] text-[#A0A5B5] border-t border-[#202333]/60 mt-3">
              <div className="flex items-center gap-1.5 font-bold text-[#F5F6FA] mb-1">
                <Terminal className="w-3.5 h-3.5 text-[#00E676]" />
                CLI APK Command
              </div>
              <code className="block p-1.5 bg-black/60 rounded border border-[#202333] font-mono text-[9px] text-[#42A5E8]">
                ./gradlew assembleRelease
              </code>
            </div>
          </div>

          {/* Right Code Display */}
          <div className="flex-1 flex flex-col bg-[#08090D] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#151720]/70 border-b border-[#202333] flex items-center justify-between text-xs">
              <span className="text-[#A0A5B5] font-mono text-[11px] truncate pr-2">
                {currentFileData?.desc}
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#202333] hover:bg-[#282d42] border border-[#2c3247] text-[11px] font-semibold text-[#F5F6FA] shrink-0 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#00E676]" />
                    <span className="text-[#00E676]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#A0A5B5]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-[#F5F6FA] bg-[#08090D] leading-relaxed selection:bg-[#42A5E8]/30">
              <pre className="whitespace-pre-wrap">
                <code>{currentFileData?.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
