import api from './api';

export interface ChatResponse {
  answer: string;
}

export async function sendMessage(question: string, model: string = 'llama3.2'): Promise<string> {
  const response = await api.post<ChatResponse>('/api/ai-chat', {
    question,
    model,
  });
  return response.data.answer;
}
