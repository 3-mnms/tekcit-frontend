// models/auth/schema/signupStepSchemas.ts
import { z } from 'zod';

// 1단계: 계정
export const signupStep1 = z
  .object({
    loginId: z.string().min(4, '아이디는 4자 이상'),
    loginPw: z.string().min(8, '비밀번호는 8자 이상'),
    passwordConfirm: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.loginPw !== v.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passwordConfirm'],
        message: '비밀번호가 일치하지 않습니다',
      });
    }
  });

// 2단계: 기본정보
export const signupStep2 = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  phone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '전화번호 형식: 010-1234-5678'),
  rrnFront: z.string().regex(/^\d{6}$/, '주민번호 앞 6자리'),
  rrnBackFirst: z.string().regex(/^[1-4]$/, '주민번호 뒤 첫 자리(1~4)'),
});

// 3단계: 주소
export const signupStep3 = z.object({
  zipCode: z.string().min(1, '우편번호를 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  detailAddress: z.string(),
});

// 4단계: 이메일 인증
export const signupStep4 = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  emailCode: z.string().min(1, '인증 코드를 입력하세요'),
});

// 최종 제출 시 서버에 보낼 전체 타입
export const signupFinalSchema = z.object({
  loginId: z.string(),
  loginPw: z.string(),
  name: z.string(),
  phone: z.string(),
  rrnFront: z.string(),
  rrnBackFirst: z.string(),
  zipCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  detailAddress: z.string().optional().nullable(),
  email: z.string().email(),
  emailCode: z.string().optional().nullable(),
});

export type Step1 = z.infer<typeof signupStep1>;
export type Step2 = z.infer<typeof signupStep2>;
export type Step3 = z.infer<typeof signupStep3>;
export type Step4 = z.infer<typeof signupStep4>;
export type SignupFinal = z.infer<typeof signupFinalSchema>;
