import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('x-api-key');
  const envApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== envApiKey) {
    throw new HTTPException(401, { message: 'Unauthorized: Invalid or missing API Key' });
  }

  await next();
});
