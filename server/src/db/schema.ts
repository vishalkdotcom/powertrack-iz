import { pgTable, uuid, varchar, timestamp, date, integer, decimal, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const readings = pgTable('readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  date: date('date').notNull(),

  // Meter Values
  groundFloorReading: integer('ground_floor_reading').notNull(),
  firstFloorReading: integer('first_floor_reading').notNull(),

  // Note: 'totalConsumption' is NOT stored.
  // It is calculated on the fly as (groundFloorReading + firstFloorReading).

  notes: text('notes'),
  imageUrl: text('image_url'),

  // Sync Meta
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(), // Logic to auto-update this on changes
});

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  billNumber: varchar('bill_number', { length: 50 }),
  billingPeriod: varchar('billing_period', { length: 7 }), // "2023-10"
  dueDate: date('due_date'),

  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  unitsConsumed: integer('units_consumed').notNull(),

  // Payment Status
  // 'isPaid' is derived: (paidDate !== null)
  paidDate: date('paid_date'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
