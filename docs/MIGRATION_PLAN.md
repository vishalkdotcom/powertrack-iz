# OctoMeter to PSPCL Tracker: Master Migration Plan

This document outlines the step-by-step plan to transform the forked **OctoMeter** codebase into the **PSPCL Electricity Tracker** application, featuring a custom Hono backend.

## 1. Project Cleanup & Preparation
**Goal:** Remove all Octopus Energy specific logic while preserving the architectural skeleton.

*   [ ] **Dependency Cleanup (`build.gradle.kts`)**
    *   Remove `apollo` (GraphQL) dependencies.
    *   Remove `multiplatform-settings` if not needed.
*   [ ] **Code Removal**
    *   Delete `graphql/` directory in `commonMain`.
    *   Delete Octopus-specific features: `Agile`, `Tariffs`, `Usage`.
    *   Delete `Account` screen.
    *   Clean up `AppNavigationHost.kt`.
*   [ ] **Rename & Refactor**
    *   Rename package `com.rwmobi.kunigami` to `com.pspcl.tracker`.

## 2. Backend Development (Hono + Drizzle)
**Goal:** Build the REST API to serve as the cloud source of truth.

*   [ ] **Scaffold Server**
    *   Initialize `server/` with `package.json`, TypeScript, and Hono.
    *   Configure `drizzle-orm` and `drizzle-kit`.
*   [ ] **Database Setup**
    *   Define Schema in `server/src/db/schema.ts`.
    *   Generate and push migrations to Neon Postgres.
*   [ ] **API Implementation**
    *   Implement `sync.ts` routes (`push`, `pull`).
    *   Implement API Key middleware.
    *   Deploy (or run locally for dev).

## 3. Architecture & Data Layer (Local-First)
**Goal:** Implement the "Local-First" architecture using Room for offline storage and Ktor for sync.

### 3.1 Domain Layer
*   [ ] Create `Reading` and `Bill` domain models.
*   [ ] Define `Repository` interfaces (`ReadingsRepository`, `BillsRepository`).

### 3.2 Local Data Source (Room)
*   [ ] Define `ReadingEntity` and `BillEntity` for Room.
*   [ ] Create `AppDatabase` and `ReadingsDao`.

### 3.3 Remote Data Source & Sync
*   [ ] **Ktor Client:** Configure Ktor to point to the Hono API URL.
*   [ ] **RemoteDataSource:** Implement `fetchUpdates(since)` and `pushUpdates(records)`.
*   [ ] **Sync Engine:**
    *   Logic: Push `isDirty` records -> Pull records where `updatedAt > lastSync`.

## 4. Core Features & UI Implementation
**Goal:** Rebuild the UI using Compose Multiplatform.

### 4.1 Dashboard Screen (Home)
*   [ ] **Layout:** Summary Card, Dual Meter Cards, "Add Reading" FAB.
*   [ ] **Action:** "Add Reading" opens a Dialog.

### 4.2 History & Bills Screen
*   [ ] List view of past readings.

### 4.3 Settings
*   [ ] Sync Status & Manual Sync Button.
*   [ ] API Key Configuration (or hardcode/env var for private use).

## 5. Business Logic (Tariffs)
**Goal:** Port existing TypeScript logic to Kotlin.

*   [ ] Create `TariffCalculator` class.
*   [ ] Implement "PSPCL" logic (Free units, Slabs).
*   [ ] Write Unit Tests.

## 6. Camera Scanning (OCR)
**Goal:** Auto-fill meter readings using camera.

### 6.1 Android Implementation
*   [ ] Integrate **CameraX** + **ML Kit**.
*   [ ] Create `CameraScanScreen`.

### 6.2 Desktop Implementation
*   [ ] Implement File Picker.

## 7. Migration Checklist & Verification
*   [ ] Verify Backend API (using Postman/Curl).
*   [ ] Verify Sync (End-to-End).
