export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface Conversation {
  id: string;
  topic: string;
  difficulty_level: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface APIResponse<T> {
  data: T;
  error?: string;
  code?: string;
} 