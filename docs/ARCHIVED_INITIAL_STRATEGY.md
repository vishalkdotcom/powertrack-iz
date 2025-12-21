# KMP Migration Strategy

## 1. Project Overview

**Goal:** Migrate the existing "PSPCL Electricity Tracker" web application (Next.js) to a native Kotlin Multiplatform (KMP) application.
**Target Platforms:** Android and Desktop (Windows). iOS is secondary.
**Base Repository:** Fork of [OctoMeter](https://github.com/ryanw-mobile/OctoMeter) (A KMP Energy Tracker).

## 2. Feature Mapping

| Feature | Current Web App (Next.js) | New KMP App | Notes |
| :--- | :--- | :--- | :--- |
| **Data Storage** | NocoDB (Server-side wrappers) | **Local-First (Room)** + **Direct Neon (Postgres)** | Hybrid approach: Offline support with direct cloud sync. |
| **Meter Tracking** | Manual Entry (Ground + First Floor) | **Manual Entry + Camera Scanning** | OCR for automatic meter reading. |
| **Charts/Analytics** | Recharts (React) | **KoalaPlot** or **Vico** | OctoMeter already uses KoalaPlot; likely reuse or adapt. |
| **Tariff Logic** | TypeScript (`lib/tariff.ts`) | **Kotlin Domain Logic** | Port calculation algorithms 1:1 to Kotlin. |
| **Theming** | Tailwind CSS + Radix UI | **Compose Material 3** | Adapt design system to Material Design. |

## 3. Migration Phases

### Phase 1: Foundation (The Fork)
1.  Fork `OctoMeter`.
2.  Strip out Octopus Energy specific API logic (GraphQL, OAuth).
3.  Keep the UI shell, Navigation, and Architecture (Voyager/Decompose, Koin).
4.  Establish the new Domain Model (`Reading`, `Bill`).

### Phase 2: Database & Sync
1.  Implement `Room` database for local storage (Android/Desktop).
2.  Implement `Postgres-JDBC` (Desktop) / `Postgres-Socket` or specialized driver for Android to connect to **Neon**.
    *   *Alternative:* Use a Ktor Client to talk to a lightweight intermediate backend if Direct DB connection proves too unstable on Android networks, but "Option C + A" implies direct.
3.  Build the "Sync Engine" to push local `Readings` to Neon and pull updates.

### Phase 3: Business Logic & UI
1.  Port `tariff.ts` logic to a pure Kotlin `TariffCalculator` class.
2.  Rebuild the "Dashboard" screen using Compose Multiplatform.
    *   Show "Dual Meter" cards (Ground vs First).
    *   Implement "Add Reading" Dialog.
3.  Rebuild "Bills" screen.

### Phase 4: Camera Scanning (New Feature)
1.  Integrate **CameraX** (Android) and a file-picker/webcam solution (Desktop).
2.  Integrate **ML Kit Text Recognition** (Android).
3.  Implement "Scan -> Parse Number -> Auto-fill Form" flow.

## 4. Key Architectural Decisions

*   **Repository Pattern:** The app will use a Repository layer that decides whether to fetch from Local DB (Room) or Remote (Neon).
*   **Offline-First:** The app always reads from Local DB. A background `SyncWorker` synchronizes Local DB with Neon.
*   **Direct DB Access:** The app will hold Postgres credentials (via user input or secure config) to write directly to Neon.
