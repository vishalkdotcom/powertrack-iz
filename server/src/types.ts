import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { readings, bills, users } from './db/schema';

// --- Users ---
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

// --- Readings ---
export const insertReadingSchema = createInsertSchema(readings, {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"), // Enforce date format
});
export const selectReadingSchema = createSelectSchema(readings);
export type Reading = z.infer<typeof selectReadingSchema>;
export type NewReading = z.infer<typeof insertReadingSchema>;

// --- Bills ---
export const insertBillSchema = createInsertSchema(bills, {
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
    paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
});
export const selectBillSchema = createSelectSchema(bills);
export type Bill = z.infer<typeof selectBillSchema>;
export type NewBill = z.infer<typeof insertBillSchema>;

// --- Sync Types ---
export const syncPushSchema = z.object({
  readings: z.array(insertReadingSchema.omit({ createdAt: true, updatedAt: true }).extend({
      id: z.string().uuid().optional(), // Allow local ID or let server generate
      // userId is optional here because the server will enforce the current user
      userId: z.string().uuid().optional()
  })),
  bills: z.array(insertBillSchema.omit({ createdAt: true, updatedAt: true }).extend({
      id: z.string().uuid().optional(),
      userId: z.string().uuid().optional()
  })),
});

export type SyncPushRequest = z.infer<typeof syncPushSchema>;

export const syncPullSchema = z.object({
    since: z.string().datetime().optional()
});
