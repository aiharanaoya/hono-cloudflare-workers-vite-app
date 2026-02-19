import { Hono } from 'hono';
import { renderToString } from 'react-dom/server';
import { messageStore } from './lib/store';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import type { MessageFormData } from './types';

const app = new Hono();

app.get('/', (c) => {
	const messages = messageStore.getAll();
	const html = renderToString(<HomePage messages={messages} />);
	return c.html(html);
});

app.get('/about', (c) => {
	const html = renderToString(<AboutPage />);
	return c.html(html);
});

app.post('/api/messages', async (c) => {
	try {
		const data = await c.req.json<MessageFormData>();

		if (!data.author?.trim() || !data.content?.trim()) {
			return c.json({ error: 'Invalid input' }, 400);
		}

		const newMessage = {
			id: crypto.randomUUID(),
			author: data.author.trim(),
			content: data.content.trim(),
			timestamp: Date.now(),
		};

		messageStore.add(newMessage);

		return c.json({ success: true, message: newMessage });
	} catch {
		return c.json({ error: 'Server error' }, 500);
	}
});

export default app;
