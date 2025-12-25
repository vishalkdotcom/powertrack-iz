import { Hono } from 'hono';
import { db } from '../db';
import { bills, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { insertBillSchema } from '../types';

const app = new Hono();

// Helper
async function getOrCreateDefaultUser() {
    const defaultEmail = 'default@example.com';
    const existing = await db.select().from(users).where(eq(users.email, defaultEmail)).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newUser = await db.insert(users).values({ email: defaultEmail }).returning();
    return newUser[0].id;
}

// GET / - List all bills
app.get('/', async (c) => {
    const userId = await getOrCreateDefaultUser();
    const result = await db.select().from(bills)
        .where(eq(bills.userId, userId))
        .orderBy(desc(bills.billingPeriod)); // Assuming sorting by period
    return c.json(result);
});

// GET /:id - Get one bill
app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.select().from(bills).where(eq(bills.id, id));
    if (result.length === 0) return c.notFound();
    return c.json(result[0]);
});

// POST / - Create bill
app.post('/', zValidator('json', insertBillSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true })), async (c) => {
    const userId = await getOrCreateDefaultUser();
    const data = c.req.valid('json');

    const result = await db.insert(bills).values({
        ...data,
        userId,
    } as any).returning();

    return c.json(result[0], 201);
});

// PATCH /:id - Update bill
app.patch('/:id', zValidator('json', insertBillSchema.partial()), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    const { id: _, userId: __, createdAt: ___, ...updateData } = data as any;

    const result = await db.update(bills)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(bills.id, id))
        .returning();

    if (result.length === 0) return c.notFound();
    return c.json(result[0]);
});

// DELETE /:id - Delete bill
app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.delete(bills).where(eq(bills.id, id)).returning();
    if (result.length === 0) return c.notFound();
    return c.json({ success: true });
});

export default app;
