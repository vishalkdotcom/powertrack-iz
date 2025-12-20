# Database Schema Design

## 1. Neon Postgres Schema (Managed by Drizzle ORM)

The database schema will be defined in TypeScript using Drizzle ORM.

### 1.1 Users Table
(Optional for V1 single-user mode, but good practice to include)

```typescript
// schema.ts
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 1.2 Readings Table

```typescript
// schema.ts
export const readings = pgTable('readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),

  date: date('date').notNull(),

  // Meter Values
  groundFloorReading: integer('ground_floor_reading').notNull(),
  firstFloorReading: integer('first_floor_reading').notNull(),

  // Computed (Optional to store, or compute on fly)
  totalConsumption: integer('total_consumption'),

  notes: text('notes'),
  imageUrl: text('image_url'),

  // Sync Meta
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(), // Triggers should update this
});
```

### 1.3 Bills Table

```typescript
// schema.ts
export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),

  billNumber: varchar('bill_number', { length: 50 }),
  billingPeriod: varchar('billing_period', { length: 7 }), // "2023-10"
  dueDate: date('due_date'),

  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  unitsConsumed: integer('units_consumed').notNull(),

  isPaid: boolean('is_paid').default(false),
  paidDate: date('paid_date'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## 2. Local Room Database (Kotlin)

The local entities mirror the remote schema but track sync state.

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
```

## 3. Migration Strategy (Drizzle)

*   We will use `drizzle-kit` to generate SQL migrations.
*   Command: `npx drizzle-kit generate:pg`
*   Command: `npx drizzle-kit push:pg` (or run migrations via code)
