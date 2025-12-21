# Backend Specification (Hono + Drizzle)

## 1. Project Structure

The backend will reside in the `server/` directory of the repository.

```
server/
├── src/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema definitions
│   │   └── index.ts        # DB connection setup
│   ├── routes/
│   │   ├── readings.ts     # Routes for /readings
│   │   ├── bills.ts        # Routes for /bills
│   │   └── sync.ts         # Specialized sync routes
│   ├── index.ts            # Hono app entry point
│   └── types.ts            # Shared types (Zod schemas)
├── drizzle.config.ts       # Drizzle Kit config
├── package.json
└── tsconfig.json
```

## 2. API Endpoints

Base URL: `/api/v1`

### 2.1. Authentication
*   **Method:** API Key
*   **Header:** `x-api-key: <YOUR_SECRET_KEY>`
*   **Middleware:** All routes (except health check) are protected by a middleware checking this header.

### 2.2. Sync Endpoints

#### POST `/sync/push`
Receives a batch of records that have been modified locally.
*   **Body:**
    ```json
    {
      "readings": [ ...list of reading objects... ],
      "bills": [ ...list of bill objects... ]
    }
    ```
*   **Logic:**
    *   Iterate through records.
    *   Perform `INSERT ... ON CONFLICT (id) DO UPDATE` (Upsert).
    *   Update `updated_at` to NOW().

#### GET `/sync/pull`
Retrieves records modified after a certain time.
*   **Query Param:** `since` (ISO Timestamp)
*   **Response:**
    ```json
    {
      "readings": [ ... ],
      "bills": [ ... ],
      "timestamp": "2023-10-27T10:00:00Z" // Current server time
    }
    ```

### 2.3. Standard CRUD (Optional/Web Admin)
*   `GET /readings` - List all
*   `GET /readings/:id` - Get one
*   `POST /readings` - Create one
*   `PATCH /readings/:id` - Update one
*   `DELETE /readings/:id` - Delete one

## 3. Tech Stack Details

*   **Framework:** `hono`
*   **Database:** `@neondatabase/serverless` driver.
*   **ORM:** `drizzle-orm`
*   **Validation:** `zod` + `@hono/zod-validator`
*   **Runtime:** `tsx` (for dev) / Node.js (prod)
*   **Package Manager:** `pnpm`

## 4. Environment Variables

Create `server/.env`:

```env
DATABASE_URL=postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb
API_KEY=my-secret-app-key
PORT=3000
```
