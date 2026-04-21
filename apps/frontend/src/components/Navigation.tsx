import { Link } from '@tanstack/react-router';

export const Navigation = () => {
	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-2">
						<span className="text-2xl">💬</span>
						<span className="text-2xl font-medium leading-relaxed text-gray-900">
							メッセージボード
						</span>
					</Link>
					<div className="flex gap-1">
						<Link
							to="/"
							activeProps={{ className: 'bg-gray-900 text-white' }}
							inactiveProps={{ className: 'text-gray-700 hover:bg-gray-100' }}
							className="px-4 py-2 rounded-md transition-colors flex items-center gap-2"
						>
							<span>💬</span>
							ボード
						</Link>
						<Link
							to="/about"
							activeProps={{ className: 'bg-gray-900 text-white' }}
							inactiveProps={{ className: 'text-gray-700 hover:bg-gray-100' }}
							className="px-4 py-2 rounded-md transition-colors flex items-center gap-2"
						>
							<span>ℹ️</span>
							About
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};
