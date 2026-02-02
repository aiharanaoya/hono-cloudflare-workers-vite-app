import type { FC } from 'react';
import { Layout } from '@/components/layout';

export const HomePage: FC = () => {
	return (
		<Layout title="Hono + React SSR">
			<div className="max-w-4xl mx-auto">
				<div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
					<div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
						<h1 className="text-4xl font-bold text-gray-800 mb-4">
							Hello, React! 🎨
						</h1>
						<p className="text-gray-600">
							Hono + React SSR + Vite + Cloudflare Workers
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
};
