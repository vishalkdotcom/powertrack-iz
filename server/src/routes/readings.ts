import { Hono } from 'hono';
import { db } from '../db';
import { readings, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { insertReadingSchema } from '../types';
import { z } from 'zod';

const app = new Hono();

// Helper (duplicated for now, could be moved to shared utils)
async function getOrCreateDefaultUser() {
    const defaultEmail = 'default@example.com';
    const existing = await db.select().from(users).where(eq(users.email, defaultEmail)).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newUser = await db.insert(users).values({ email: defaultEmail }).returning();
    return newUser[0].id;
}

// GET / - List all readings
app.get('/', async (c) => {
    const userId = await getOrCreateDefaultUser();
    const result = await db.select().from(readings)
        .where(eq(readings.userId, userId))
        .orderBy(desc(readings.date));
    return c.json(result);
});

// GET /:id - Get one reading
app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.select().from(readings).where(eq(readings.id, id));
    if (result.length === 0) return c.notFound();
    return c.json(result[0]);
});

// POST / - Create reading
app.post('/', zValidator('json', insertReadingSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true })), async (c) => {
    const userId = await getOrCreateDefaultUser();
    const data = c.req.valid('json');

    const result = await db.insert(readings).values({
        ...data,
        userId,
    } as any).returning();

    return c.json(result[0], 201);
});

// PATCH /:id - Update reading
app.patch('/:id', zValidator('json', insertReadingSchema.partial()), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // Remove immutable fields if present in payload (though partial() doesn't strictly remove them, we should ignore them)
    const { id: _, userId: __, createdAt: ___, ...updateData } = data as any;

    const result = await db.update(readings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(readings.id, id))
        .returning();

    if (result.length === 0) return c.notFound();
    return c.json(result[0]);
});

// DELETE /:id - Delete reading
app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.delete(readings).where(eq(readings.id, id)).returning();
    if (result.length === 0) return c.notFound();
    return c.json({ success: true });
});

export default app;
