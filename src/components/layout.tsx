import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	title: string;
}>;

export const Layout: FC<Props> = ({ title, children }) => {
	return (
		<html lang="ja">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link href="/src/style.css" rel="stylesheet" />
			</head>
			<body className="bg-gray-50 min-h-screen">
				<header className="bg-white shadow">
					<nav className="container mx-auto px-4 py-4">
						<h1 className="text-xl font-bold text-gray-800">{title}</h1>
					</nav>
				</header>
				<main className="container mx-auto px-4 py-8">{children}</main>
				<footer className="bg-gray-800 text-white mt-auto">
					<div className="container mx-auto px-4 py-6 text-center">
						<p>© 2025 Built with Hono + React + Cloudflare Workers</p>
					</div>
				</footer>
			</body>
		</html>
	);
};
