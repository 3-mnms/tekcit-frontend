import { z } from 'zod';

export const signupSchema = z.object({
  loginId: z.string().min(4, '아이디는 최소 4자 이상이어야 해요!'),
  loginPw: z.string().min(6, '비밀번호는 최소 6자 이상이어야 해요!'),
  name: z.string().min(2, '이름을 입력해 주세요!'),
  phone: z
    .string()
    .regex(/^01[016789]-\d{3,4}-\d{4}$/, '전화번호 형식이 올바르지 않아요!'),
  email: z
    .string()
    .email('이메일 형식을 확인해 주세요!'),

  userProfile: z.object({
    residentNum: z
      .string()
      .regex(/^\d{6}-[1-4]$/, '주민등록번호 형식을 확인해 주세요!'),
    address: z.string().min(1, '주소를 입력해 주세요!'),
  }),

  hostProfile: z
    .object({
      businessName: z.string().min(1, '사업체 명을 입력해 주세요!'),
      genre: z.string().optional(),
    })
    .optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
