import { Hono } from 'hono';
import { renderer } from './renderer';

const app = new Hono();

app.use(renderer);

app.get('/', (c) => {
	return c.render(
		<div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
			<div class="bg-white rounded-lg shadow-2xl p-8 max-w-md">
				<h1 class="text-4xl font-bold text-gray-800 mb-4">
					Hello, Tailwind! 🎨
				</h1>
			</div>
		</div>,
	);
});

export default app;
