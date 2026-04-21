import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { messagesRoute } from './routes/messages';

const app = new Hono()
	.use(cors())
	.route('/api/messages', messagesRoute);

export type AppType = typeof app;
export type { Message } from './types';
export default app;
