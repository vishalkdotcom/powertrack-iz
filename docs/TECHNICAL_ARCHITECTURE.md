# Technical Architecture

## 1. High-Level Architecture

The application follows the recommended **Kotlin Multiplatform Mobile (KMM)** architecture with a strong separation of concerns.

```mermaid
graph TD
    UI[Compose Multiplatform UI] --> ViewModel[Shared ViewModels]
    ViewModel --> UseCase[Domain Use Cases]
    UseCase --> Repository[Data Repository]
    Repository --> Local[Local Data Source (Room)]
    Repository --> Remote[Remote Data Source (Neon Postgres)]
```

## 2. Tech Stack

| Component | Technology | Reason |
| :--- | :--- | :--- |
| **Language** | Kotlin | Core requirement. |
| **UI Framework** | Compose Multiplatform | Shared UI for Android & Desktop. |
| **Navigation** | Voyager or Jetpack Navigation | OctoMeter uses Voyager; stick with it for ease. |
| **DI** | Koin | Standard for KMP. |
| **Networking** | Ktor Client | Multiplatform networking. |
| **Local DB** | **Room** (Multiplatform) | Now supports KMP (Android, iOS, JVM). Preferred over SQLDelight for this specific migration if familiar with Room/TypeORM style. |
| **Remote DB** | **Postgres (Neon)** | User requirement. |
| **Charts** | KoalaPlot | Existing in OctoMeter. |

## 3. Data Layer Details

### 3.1. Local-First Strategy ("Option C")
*   **Database:** `Room` Database.
*   **Entities:** `ReadingEntity`, `BillEntity`.
*   **Operation:** All UI Read/Write operations happen against the local Room database to ensure zero-latency and offline capability.

### 3.2. Remote Synchronization ("Option A")
*   **Connection:** Direct connection to Neon Postgres.
*   **Library:**
    *   **Android:** standard JDBC is problematic. Use a Ktor-based PostgreSQL client (like `exposed` with a compatible driver, or a direct raw socket implementation if available).
    *   *Correction:* Direct Postgres connection from an Android app is technically challenging and insecure.
    *   **Recommended approach for "Direct" feel:** Use **Supabase** (which uses Postgres) or a **PostgREST** wrapper around Neon.
    *   *If strictly Neon Raw SQL:* We might need a small Ktor Server sidecar or just accept the limitations (using a driver like `pgjdbc-ng` on Android can be flaky).
    *   **Proposed Compromise:** The simplest "Direct" way for KMP without a backend is using **Supabase** (which *is* Postgres + Auth + API).
    *   *However*, sticking to the user's "Neon" request: We will treat Neon as a generic Postgres DB. We will need a **JDBC driver** that works on Android (e.g., specific builds of PostgreSQL JDBC) or run queries via a light serverless function (which technically violates pure "Direct", but ensures stability).
    *   *Assumption for this plan:* We will attempt to use a JVM JDBC driver for Desktop and investigate a compatible driver for Android, OR use a simple REST API (PostgREST) running on Neon (if available) or a tiny Vercel function.

### 3.3. Sync Logic
1.  **Pull:** On app launch, query Remote `readings` where `updated_at > last_sync_timestamp`. Upsert into Local.
2.  **Push:** When a user creates a reading, mark it as `dirty`. Background job pushes `dirty` records to Remote.

## 4. Platform Specifics

### Android
*   **Camera:** CameraX + ML Kit for OCR.
*   **Background Work:** WorkManager for Sync.

### Desktop (Windows)
*   **Camera:** JavaCV or simple file upload (drag & drop photo).
*   **Windowing:** Compose for Desktop window management.
