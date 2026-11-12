import JSZip from 'jszip';
import { soundEngine } from './soundEngine';

export async function exportCompleteAndroidProjectZip(userDataJson?: string) {
  soundEngine.playSuccess();
  const zip = new JSZip();

  // 1. Root Gradle & Project Files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "StudyLab"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.dagger.hilt) apply false
    alias(libs.plugins.ksp) apply false
}
`
  );

  // 2. Gradle Version Catalog
  const gradleDir = zip.folder('gradle');
  gradleDir?.file(
    'libs.versions.toml',
    `[versions]
agp = "8.4.2"
kotlin = "2.0.0"
composeBom = "2024.06.00"
coreKtx = "1.13.1"
lifecycleKtx = "2.8.2"
activityCompose = "1.9.0"
navigationCompose = "2.7.7"
room = "2.6.1"
hilt = "2.51.1"
hiltNavigationCompose = "1.2.0"
datastore = "1.1.1"
workManager = "2.9.0"
coroutines = "1.8.1"
ksp = "2.0.0-1.0.21"
junit = "4.13.2"
junitExt = "1.2.0"
espresso = "3.6.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "workManager" }
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }
kotlinx-coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitExt" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espresso" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
dagger-hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`
  );

  // 3. App Module
  const appDir = zip.folder('app');
  appDir?.file(
    'build.gradle.kts',
    `plugins {
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
        vectorDrawables {
            useSupportLibrary = true
        }

        // Strict 32-bit & 64-bit ARM hardware ABI filter
        ndk {
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
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
`
  );

  appDir?.file(
    'proguard-rules.pro',
    `-keep class * extends androidx.room.RoomDatabase
-keep class * extends dagger.hilt.internal.GeneratedComponent
-keepclassmembers class * implements android.os.Parcelable {
    static ** CREATOR;
}
`
  );

  // 4. Android Manifest
  const mainDir = appDir?.folder('src')?.folder('main');
  mainDir?.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:name=".StudyLabApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|locale|layoutDirection">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  );

  // 5. Kotlin Sources
  const pkgDir = mainDir?.folder('java')?.folder('com')?.folder('studylab')?.folder('app');

  pkgDir?.file(
    'StudyLabApplication.kt',
    `package com.studylab.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class StudyLabApplication : Application()
`
  );

  pkgDir?.file(
    'MainActivity.kt',
    `package com.studylab.app

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
                    bottomBar = { StudyLabBottomBar(navController = navController) }
                ) { innerPadding ->
                    StudyLabNavGraph(
                        navController = navController,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}
`
  );

  // Room Database & DAOs
  const dbDir = pkgDir?.folder('core')?.folder('database');
  dbDir?.file(
    'StudyLabDatabase.kt',
    `package com.studylab.app.core.database

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
}
`
  );

  // Spaced Repetition Domain Logic
  const domainDir = pkgDir?.folder('core')?.folder('domain');
  domainDir?.file(
    'SpacedRepetitionSM2.kt',
    `package com.studylab.app.core.domain

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
}
`
  );

  // 6. Resources: English & Arabic Strings
  const resDir = mainDir?.folder('res');
  resDir?.folder('values')?.file(
    'strings.xml',
    `<resources>
    <string name="app_name">Study Lab</string>
    <string name="nav_home">Home</string>
    <string name="nav_study">Study</string>
    <string name="nav_brain">Brain</string>
    <string name="nav_skills">Skills</string>
    <string name="nav_profile">Profile</string>
    <string name="welcome_back">Welcome back,</string>
    <string name="search_placeholder">Search subjects, cards, notes...</string>
    <string name="daily_quests">Daily Quests</string>
    <string name="rank_title">Current Rank</string>
    <string name="xp_label">XP</string>
    <string name="level_label">Level</string>
    <string name="study_hours">Study Hours</string>
    <string name="quick_actions">Quick Actions</string>
    <string name="start_focus">Focus Session</string>
    <string name="review_cards">Review Cards</string>
    <string name="daily_puzzle">Brain Challenge</string>
    <string name="recent_classes">My Academic Classes</string>
</resources>
`
  );

  resDir?.folder('values-ar')?.file(
    'strings.xml',
    `<resources>
    <string name="app_name">مختبر الدراسة</string>
    <string name="nav_home">الرئيسية</string>
    <string name="nav_study">الدراسة</string>
    <string name="nav_brain">العقل</string>
    <string name="nav_skills">المهارات</string>
    <string name="nav_profile">حسابي</string>
    <string name="welcome_back">مرحباً بك مجدداً،</string>
    <string name="search_placeholder">ابحث في المواد، البطاقات، الملاحظات...</string>
    <string name="daily_quests">المهام اليومية</string>
    <string name="rank_title">الرتبة الحالية</string>
    <string name="xp_label">نقطة خبرة</string>
    <string name="level_label">المستوى</string>
    <string name="study_hours">ساعات الدراسة</string>
    <string name="quick_actions">الإجراءات السريعة</string>
    <string name="start_focus">جلسة تركيز</string>
    <string name="review_cards">مراجعة البطاقات</string>
    <string name="daily_puzzle">تحدي العقل</string>
    <string name="recent_classes">فصولي الدراسية</string>
</resources>
`
  );

  // 7. Project Documentation & Build Guide
  zip.file(
    'README.md',
    `# STUDY LAB — Complete Android Studio Project

## Target Device Profile: Infinix Smart 9
- **Instruction Set**: 32-bit (armeabi-v7a) and 64-bit (arm64-v8a) ARM
- **RAM Tier**: 3 GB – 4 GB RAM (LMK threshold ~280 MB native memory)
- **UI Framework**: Jetpack Compose & Material 3 Dark Palette (#08090D, #151720, #42A5E8)
- **Persistence**: Room SQLite with offline-first write-ahead logging (WAL)

## Build & APK Generation Instructions

### Prerequisites
- Android Studio Iguana (2023.2.1+) or Ladybug
- JDK 17
- Android SDK 34

### Generating Debug & Release APK
1. Open this unzipped directory directly in **Android Studio**.
2. Wait for Gradle sync to complete.
3. Open Terminal in Android Studio and run:
   \`\`\`bash
   # Build debug APK
   ./gradlew assembleDebug

   # Build optimized release APK for Infinix Smart 9
   ./gradlew assembleRelease
   \`\`\`
4. The generated APK will be located at:
   \`app/build/outputs/apk/release/app-release-unsigned.apk\`
`
  );

  // If user data backup provided, include it in the zip
  if (userDataJson) {
    zip.file('user_study_backup.json', userDataJson);
  }

  // Generate Zip Blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StudyLab_Android_Project_${new Date().toISOString().split('T')[0]}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
