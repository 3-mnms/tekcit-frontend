import { z } from 'zod';

export const signupSchema = z.object({
  loginId: z.string().min(4, '아이디는 4자 이상'),
  password: z.string().min(8, '비밀번호는 8자 이상'),
  passwordConfirm: z.string(),
  name: z.string().min(2, '이름은 2자 이상'),
  phone: z.string().regex(/^010-?\d{4}-?\d{4}$/, '전화번호 형식 010-0000-0000'),
  rrnFront: z.string().length(6, '주민번호 앞 6자리'),
  rrnBackFirst: z.string().length(1, '주민번호 뒤 첫 자리'),
  zonecode: z.string().min(1, '우편번호를 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  detailAddress: z.string().min(1, '상세주소를 입력하세요'),
  email: z.string().email('이메일 형식이 아님'),
  emailCode: z.string().min(1, '인증 코드를 입력하세요'),
}).refine(v => v.password === v.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

export type SignupForm = z.infer<typeof signupSchema>;