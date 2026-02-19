import type { FC } from 'react';
import { Layout } from '@/components/Layout';
import { MessageList } from '@/components/MessageList';
import { Navigation } from '@/components/Navigation';
import type { Message } from '@/types';

interface HomePageProps {
	messages: Message[];
}

export const HomePage: FC<HomePageProps> = ({ messages }) => {
	return (
		<Layout title="メッセージボード" includeIslands={true}>
			<div className="min-h-screen bg-gray-50">
				<Navigation currentPath="/" />
				<main className="container mx-auto px-4 py-8 max-w-4xl">
					<div className="mb-8">
						<h1 className="text-3xl font-medium leading-relaxed mb-2">
							メッセージボード
						</h1>
						<p className="text-base leading-relaxed text-gray-600">
							自由にメッセージを投稿してコミュニケーションを楽しもう
						</p>
					</div>

					<div id="message-form-island">
						<div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
							<h2 className="text-2xl font-medium leading-relaxed mb-4">
								メッセージを投稿
							</h2>
							<p className="text-base leading-relaxed text-gray-500">
								読み込み中...
							</p>
						</div>
					</div>

					<MessageList messages={messages} />
				</main>
			</div>
		</Layout>
	);
};
