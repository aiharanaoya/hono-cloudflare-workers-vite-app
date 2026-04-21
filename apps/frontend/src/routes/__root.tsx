import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Navigation } from '@/components/Navigation';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<Outlet />
		</div>
	);
}
