# Database Schema Design

## 1. Neon Postgres Schema (Remote)

This schema adapts the previous NocoDB structure to standard SQL.

```sql
-- Users table (Optional, if multiple users share the DB)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meter Readings Table
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Optional
    date DATE NOT NULL,

    -- Dual Meter Support
    ground_floor_reading INTEGER NOT NULL,
    first_floor_reading INTEGER NOT NULL,

    -- Calculated/Derived (can be computed, but storing for history is safe)
    total_consumption INTEGER GENERATED ALWAYS AS (ground_floor_reading + first_floor_reading) STORED,

    notes TEXT,
    image_url TEXT, -- Link to scanned meter image if uploaded

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_readings CHECK (ground_floor_reading >= 0 AND first_floor_reading >= 0)
);

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Optional

    bill_number VARCHAR(50),
    billing_period VARCHAR(7), -- Format: "YYYY-MM"
    due_date DATE,

    amount DECIMAL(10, 2) NOT NULL,
    units_consumed INTEGER NOT NULL,

    -- Tariff Snapshot (store rate used at time of bill)
    tariff_snapshot JSONB,

    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync State (Optional, for conflict resolution)
-- Used to track the last modification time for efficient syncing
CREATE INDEX IF NOT EXISTS idx_readings_updated_at ON readings(updated_at);
```

## 2. Local Room Database (Kotlin)

The local entities should mirror the remote schema but include sync-specific fields.

```kotlin
@Entity(tableName = "readings")
data class ReadingEntity(
    @PrimaryKey val id: String, // UUID
    val date: String, // ISO 8601
    val groundFloorReading: Int,
    val firstFloorReading: Int,
    val notes: String?,

    // Sync Status
    val isDirty: Boolean = false, // True if modified locally and not yet pushed
    val lastSyncedAt: Long? = null
)

@Entity(tableName = "bills")
data class BillEntity(
    @PrimaryKey val id: String,
    val billNumber: String?,
    val billingPeriod: String,
    val amount: Double,
    val isDirty: Boolean = false
)
```

## 3. Sync Protocol

### "Push" (Local -> Remote)
1.  Select all `ReadingEntity` where `isDirty == true`.
2.  For each, perform `INSERT` or `UPDATE` on Neon.
3.  If successful, set `isDirty = false`.

### "Pull" (Remote -> Local)
1.  Fetch `MAX(updated_at)` from local DB.
2.  Query Neon: `SELECT * FROM readings WHERE updated_at > :localMax`.
3.  Insert/Update these records in Local DB.
