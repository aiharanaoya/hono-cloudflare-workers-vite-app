import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	title: string;
	includeIslands?: boolean;
}>;

export const Layout: FC<Props> = ({
	title,
	children,
	includeIslands = false,
}) => {
	return (
		<html lang="ja">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link href="/src/style.css" rel="stylesheet" />
			</head>
			<body>
				{children}
				{includeIslands && <script type="module" src="/islands.js" />}
			</body>
		</html>
	);
};
