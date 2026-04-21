import { createFileRoute } from '@tanstack/react-router';
import { MessageForm } from '@/components/MessageForm';
import { MessageList } from '@/components/MessageList';

export const Route = createFileRoute('/')({
	component: HomePage,
});

function HomePage() {
	return (
		<main className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-medium leading-relaxed mb-2">
					メッセージボード
				</h1>
				<p className="text-base leading-relaxed text-gray-600">
					自由にメッセージを投稿してコミュニケーションを楽しもう
				</p>
			</div>
			<MessageForm />
			<MessageList />
		</main>
	);
}
