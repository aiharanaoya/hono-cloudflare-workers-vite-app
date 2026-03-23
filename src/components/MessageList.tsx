import type { FC } from 'react';
import type { Message } from '@/types';

interface MessageListProps {
	messages: Message[];
}

export const MessageList: FC<MessageListProps> = ({ messages }) => {
	if (messages.length === 0) {
		return (
			<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
				<div className="text-6xl mb-4">💬</div>
				<p className="text-base leading-relaxed text-gray-500">
					まだメッセージがありません
				</p>
				<p className="text-sm leading-relaxed text-gray-400 mt-2">
					最初のメッセージを投稿してみましょう！
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-all"
				>
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-xl font-medium leading-relaxed text-gray-900">
							{message.author}
						</h3>
						<time className="text-sm leading-relaxed text-gray-500">
							{new Intl.DateTimeFormat('ja-JP', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							}).format(new Date(message.timestamp))}
						</time>
					</div>
					<p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
						{message.content}
					</p>
				</div>
			))}
		</div>
	);
};
