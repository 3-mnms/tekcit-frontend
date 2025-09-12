import { api } from '@/shared/config/axios';

export async function askChat(question: string): Promise<string> {
  const res = await api.post('/festival/chat', { question });
  const data = res.data;

  if (data?.data?.answer) return String(data.data.answer);

  if (typeof data?.answer === 'string') return data.answer;
  if (typeof data?.data === 'string') return data.data;
  if (typeof data?.result?.answer === 'string') return data.result.answer;
  if (Array.isArray(data?.content) && data.content[0]?.text) return data.content[0].text;

  return typeof data === 'string' ? data : JSON.stringify(data);
}
