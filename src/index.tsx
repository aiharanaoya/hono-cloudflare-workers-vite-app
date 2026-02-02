import { Hono } from 'hono';
import { renderToString } from 'react-dom/server';
import { HomePage } from './pages/home';

const app = new Hono();

app.get('/', (c) => {
	const html = renderToString(<HomePage />);
	return c.html(html);
});

export default app;
