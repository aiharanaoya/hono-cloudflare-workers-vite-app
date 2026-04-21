export interface Message {
	id: string;
	author: string;
	content: string;
	timestamp: number;
}

export interface MessageFormData {
	author: string;
	content: string;
}
