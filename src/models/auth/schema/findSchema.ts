import { z } from 'zod';

export const findIdSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
});

export type FindIdForm = z.infer<typeof findIdSchema>;

export const findPwEmailSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력하세요.'),
  name: z.string().min(1, '이름을 입력하세요.'),
});

export type FindPwEmailForm = z.infer<typeof findPwEmailSchema>;