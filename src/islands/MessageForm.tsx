import { type FC, type SubmitEvent, useState } from 'react';

export const MessageForm: FC = () => {
	const [author, setAuthor] = useState('');
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!author.trim() || !content.trim()) return;

		setIsSubmitting(true);

		try {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					author: author.trim(),
					content: content.trim(),
				}),
			});

			if (res.ok) {
				window.location.reload();
			} else {
				alert('投稿に失敗しました');
			}
		} catch {
			alert('エラーが発生しました');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white border border-gray-200 rounded-lg p-6 mb-8"
		>
			<h2 className="text-2xl font-medium leading-relaxed mb-4">
				メッセージを投稿
			</h2>
			<div className="mb-4">
				<label
					htmlFor="author"
					className="block text-base font-medium leading-relaxed text-gray-700 mb-2"
				>
					名前
				</label>
				<input
					type="text"
					id="author"
					value={author}
					onChange={(e) => setAuthor(e.target.value)}
					className="w-full text-base leading-relaxed px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
					placeholder="あなたの名前を入力"
					required
				/>
			</div>
			<div className="mb-4">
				<label
					htmlFor="content"
					className="block text-base font-medium leading-relaxed text-gray-700 mb-2"
				>
					メッセージ
				</label>
				<textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="w-full text-base leading-relaxed px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
					placeholder="メッセージを入力"
					rows={4}
					required
				/>
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full text-base font-medium leading-relaxed bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
			>
				<span>📤</span>
				{isSubmitting ? '投稿中...' : '投稿する'}
			</button>
		</form>
	);
};
