import type { FC } from 'react';

interface NavigationProps {
	currentPath: string;
}

export const Navigation: FC<NavigationProps> = ({ currentPath }) => {
	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<a href="/" className="flex items-center gap-2">
						<span className="text-2xl">💬</span>
						<span className="text-2xl font-medium leading-relaxed text-gray-900">
							メッセージボード
						</span>
					</a>
					<div className="flex gap-1">
						<a
							href="/"
							className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
								currentPath === '/'
									? 'bg-gray-900 text-white'
									: 'text-gray-700 hover:bg-gray-100'
							}`}
						>
							<span>💬</span>
							ボード
						</a>
						<a
							href="/about"
							className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
								currentPath === '/about'
									? 'bg-gray-900 text-white'
									: 'text-gray-700 hover:bg-gray-100'
							}`}
						>
							<span>ℹ️</span>
							About
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
};
