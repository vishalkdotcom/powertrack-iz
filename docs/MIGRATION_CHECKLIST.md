# Migration Checklist

- [ ] **1. Cleanup Phase**
    - [ ] Remove Apollo/GraphQL dependencies from `build.gradle.kts`.
    - [ ] Delete `composeApp/src/commonMain/graphql`.
    - [ ] Delete `composeApp/src/commonMain/kotlin/com/rwmobi/kunigami/ui/destinations/agile`.
    - [ ] Delete `composeApp/src/commonMain/kotlin/com/rwmobi/kunigami/ui/destinations/tariffs`.
    - [ ] Delete `composeApp/src/commonMain/kotlin/com/rwmobi/kunigami/ui/destinations/usage`.
    - [ ] Delete `composeApp/src/commonMain/kotlin/com/rwmobi/kunigami/ui/destinations/account`.
    - [ ] Clean up `AppNavigationHost.kt`.

- [x] **2. Backend Setup (Hono)**
    - [x] Create `server/` directory.
    - [x] `cd server && pnpm init`
    - [x] Install dependencies: `pnpm add hono drizzle-orm postgres @neondatabase/serverless zod dotenv`.
    - [x] Install dev-deps: `pnpm add -D drizzle-kit tsx @types/node typescript`.
    - [x] Create `server/src/db/schema.ts` with Readings and Bills tables.
    - [x] Create `server/src/index.ts` (Hono app).
    - [x] Implement `POST /api/sync/push`.
    - [x] Implement `GET /api/sync/pull`.
    - [x] Test API with Curl/Postman.

- [ ] **3. Domain & Data Layer (KMP)**
    - [ ] Create `Reading` and `Bill` data classes.
    - [ ] Define `ReadingEntity` (Room).
    - [ ] Update `AppDatabase`.
    - [ ] Implement `ReadingsDao`.
    - [ ] **Network:** Setup `Ktor` client with `x-api-key` header support.
    - [ ] Implement `RemoteDataSource` calling Hono endpoints.
    - [ ] Implement `SyncRepository`.

- [ ] **4. UI Implementation**
    - [ ] Create `DashboardScreen` (Material 3).
    - [ ] Create `HistoryScreen`.
    - [ ] Create `SettingsScreen` (Input for API URL/Key if dynamic).
    - [ ] Implement `AddReadingDialog`.

- [ ] **5. Logic**
    - [ ] Implement `TariffCalculator` (Port from TS).
    - [ ] Unit Test `TariffCalculator`.

- [ ] **6. Camera (Android)**
    - [ ] Add CameraX + ML Kit dependencies.
    - [ ] Create `CameraPreview` composable.
    - [ ] Implement OCR logic.
