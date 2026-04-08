export interface Message {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
	thinking?: string;
	imageData?: string;
}
