import { z } from 'zod';

export const loginSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력하세요'),
  loginPw: z.string().min(1, '비밀번호를 입력하세요'),
});

export type LoginForm = z.infer<typeof loginSchema>;
