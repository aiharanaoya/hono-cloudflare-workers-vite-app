import { createRoot } from 'react-dom/client';
import { MessageForm } from './islands/MessageForm';

if (typeof document !== 'undefined') {
	const formContainer = document.getElementById('message-form-island');
	if (formContainer) {
		createRoot(formContainer).render(<MessageForm />);
	}
}
