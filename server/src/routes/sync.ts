import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { syncPushSchema, syncPullSchema } from '../types';
import { db } from '../db';
import { readings, bills, users } from '../db/schema';
import { eq, gt, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const sync = new Hono();

// Helper to get or create a default user for V1
// In a real multi-user app, we would get the user from the auth token
async function getOrCreateDefaultUser() {
    const defaultEmail = 'default@example.com';
    const existing = await db.select().from(users).where(eq(users.email, defaultEmail)).limit(1);

    if (existing.length > 0) {
        return existing[0].id;
    }

    const newUser = await db.insert(users).values({
        email: defaultEmail,
    }).returning();

    return newUser[0].id;
}

sync.post('/push', zValidator('json', syncPushSchema), async (c) => {
    const { readings: pushedReadings, bills: pushedBills } = c.req.valid('json');
    const userId = await getOrCreateDefaultUser();

    // Upsert Readings
    for (const reading of pushedReadings) {
        const readingData = {
            ...reading,
            userId: userId, // Enforce User ID
            updatedAt: new Date(),
        };

        await db.insert(readings)
            .values(readingData as any) // Cast needed because of optional id in schema vs required in DB (but insert handles optional if undefined, though here we might pass it)
            .onConflictDoUpdate({
                target: readings.id,
                set: {
                    ...readingData,
                }
            });
    }

    // Upsert Bills
    for (const bill of pushedBills) {
        const billData = {
            ...bill,
            userId: userId,
            updatedAt: new Date(),
        };

        await db.insert(bills)
            .values(billData as any)
            .onConflictDoUpdate({
                target: bills.id,
                set: {
                    ...billData,
                }
            });
    }

    return c.json({ success: true, message: 'Sync push successful' });
});

sync.get('/pull', zValidator('query', syncPullSchema), async (c) => {
    const { since } = c.req.valid('query');
    const userId = await getOrCreateDefaultUser();

    let fetchedReadings;
    let fetchedBills;

    if (since) {
        const sinceDate = new Date(since);
        // Note: In a real multi-user app, filter by userId as well: .where(and(eq(readings.userId, userId), ...))
        // But here we are assuming single tenant or strictly filtered by the ID we found.
        // Let's filter by UserID for correctness.
        fetchedReadings = await db.select().from(readings)
            .where(
                sql`${readings.userId} = ${userId} AND (${readings.updatedAt} > ${sinceDate} OR ${readings.createdAt} > ${sinceDate})`
            );

        fetchedBills = await db.select().from(bills)
            .where(
                sql`${bills.userId} = ${userId} AND (${bills.updatedAt} > ${sinceDate} OR ${bills.createdAt} > ${sinceDate})`
            );

    } else {
        // Fetch all
        fetchedReadings = await db.select().from(readings).where(eq(readings.userId, userId));
        fetchedBills = await db.select().from(bills).where(eq(bills.userId, userId));
    }

    return c.json({
        readings: fetchedReadings,
        bills: fetchedBills,
        timestamp: new Date().toISOString()
    });
});

export default sync;
