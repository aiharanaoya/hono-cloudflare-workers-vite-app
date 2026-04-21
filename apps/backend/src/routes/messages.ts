import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { Message } from '../types';

const messageStore: Message[] = [];

const messageFormSchema = z.object({
	author: z.string().min(1),
	content: z.string().min(1),
});

export const messagesRoute = new Hono()
	.get('/', (c) => {
		const sorted = [...messageStore].sort((a, b) => b.timestamp - a.timestamp);
		return c.json(sorted);
	})
	.post('/', zValidator('json', messageFormSchema), (c) => {
		const data = c.req.valid('json');
		const newMessage: Message = {
			id: crypto.randomUUID(),
			author: data.author.trim(),
			content: data.content.trim(),
			timestamp: Date.now(),
		};
		messageStore.push(newMessage);
		return c.json({ success: true, message: newMessage });
	});
