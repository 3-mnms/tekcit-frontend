import { z } from 'zod';

const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?]).{8,}$/;

export const signupStep1 = z
  .object({
    loginId: z.string().min(4, '아이디는 4자 이상 입력하세요.'),
    // ✅ 한 번에 메시지
    loginPw: z
      .string()
      .regex(
        PASSWORD_REGEX,
        '8~20자의 영문/숫자/특수문자를 모두 포함해야 합니다.'
      ),
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

export const signupStep2 = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력하세요.'),
  phone: z
    .string()
    .regex(/^01[016789]-?\d{4}-?\d{4}$/, '전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678'),
  rrnFront: z.string().regex(/^\d{6}$/, '주민번호 앞 6자리를 입력하세요.'),
  rrnBackFirst: z.string().min(1, '주민번호를 입력하세요.').regex(/^[1-4]$/, '주민등록번호 뒷자리 첫 글자는 1~4만 가능합니다.'),
});

export const signupStep3 = z.object({
  zipCode: z.string().min(1, '우편번호를 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  detailAddress: z.string(),
});

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
