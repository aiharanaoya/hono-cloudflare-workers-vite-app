import type { Message } from '@/types';

class MessageStore {
	private messages: Message[] = [];

	getAll(): Message[] {
		return [...this.messages].sort((a, b) => b.timestamp - a.timestamp);
	}

	add(message: Message): void {
		this.messages.push(message);
	}
}

export const messageStore = new MessageStore();
