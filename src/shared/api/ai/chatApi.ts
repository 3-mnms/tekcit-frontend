// src/shared/api/chat/chatApi.ts
import { api2 } from '@/shared/config/axios';

export async function askChat(question: string): Promise<string> {
  const res = await api2.post('/ai/chat', { question });

  const data = res.data;

  // FastAPI에서 {"answer": "..."} 식으로 주는 경우
  if (typeof data === 'string') return data;
  if (typeof data?.answer === 'string') return data.answer;
  if (typeof data?.data === 'string') return data.data;

  // 혹시 객체가 왔으면 JSON 문자열로라도 보여주자
  return JSON.stringify(data);
}
