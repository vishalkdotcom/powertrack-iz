import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth';
import syncRoutes from './routes/sync';
import readingRoutes from './routes/readings';
import billRoutes from './routes/bills';

dotenv.config();

const app = new Hono().basePath('/api/v1');

app.use('*', logger());
app.use('*', cors());

// Health Check (Public)
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Auth Middleware for all other routes
app.use('*', authMiddleware);

// Routes
app.route('/sync', syncRoutes);
app.route('/readings', readingRoutes);
app.route('/bills', billRoutes);

const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
