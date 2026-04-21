import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
	component: AboutPage,
});

function AboutPage() {
	return (
		<main className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-medium leading-relaxed mb-6">
					メッセージボードについて
				</h1>

				<div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
					<h2 className="text-2xl font-medium leading-relaxed mb-4">
						このアプリケーションについて
					</h2>
					<p className="text-base leading-relaxed text-gray-700 mb-4">
						シンプルなメッセージボードアプリケーションです。誰でも自由にメッセージを投稿して、
						コミュニケーションを楽しむことができます。
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6 mb-6">
					<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-4xl">💬</span>
							<h3 className="text-xl font-medium leading-relaxed">
								メッセージ投稿
							</h3>
						</div>
						<p className="text-base leading-relaxed text-gray-700">
							名前とメッセージを入力するだけで、簡単に投稿できます。
						</p>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-4xl">👥</span>
							<h3 className="text-xl font-medium leading-relaxed">
								誰でも投稿可能
							</h3>
						</div>
						<p className="text-base leading-relaxed text-gray-700">
							登録不要で、すぐにメッセージボードを利用できます。
						</p>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-4xl">⚡</span>
							<h3 className="text-xl font-medium leading-relaxed">
								リアルタイム更新
							</h3>
						</div>
						<p className="text-base leading-relaxed text-gray-700">
							投稿されたメッセージはすぐに反映されます。
						</p>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-4xl">ℹ️</span>
							<h3 className="text-xl font-medium leading-relaxed">
								シンプル設計
							</h3>
						</div>
						<p className="text-base leading-relaxed text-gray-700">
							使いやすさを最優先に、シンプルな機能で構成されています。
						</p>
					</div>
				</div>

				<div className="bg-gray-900 text-white rounded-lg p-6">
					<h3 className="text-xl font-medium leading-relaxed mb-3">使い方</h3>
					<ol className="list-decimal list-inside space-y-2 text-base leading-relaxed">
						<li>名前を入力します</li>
						<li>メッセージを入力します</li>
						<li>「投稿する」ボタンをクリックします</li>
						<li>投稿したメッセージが一覧に表示されます</li>
					</ol>
				</div>
			</div>
		</main>
	);
}
