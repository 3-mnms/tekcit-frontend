// src/models/chatbot/tanstack-query/useChatbot.ts
import { useMutation } from '@tanstack/react-query';
import { askChat } from '@/shared/api/ai/chatApi';

export function useChatbot() {
  return useMutation({
    mutationKey: ['chatbot', 'ask'],
    mutationFn: askChat,
  });
}
