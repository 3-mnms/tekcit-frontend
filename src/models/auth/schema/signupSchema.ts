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
    .regex(/^01[016789]-?\d{4}-?\d{4}$/, '전화번호 형식이 올바르지 않습니다.'),
  rrnFront: z.string().regex(/^\d{6}$/, '주민번호를\n 입력하세요.'),
  rrnBackFirst: z.string().min(1, '주민번호를 입력하세요.').regex(/^[1-4]$/, '주민등록번호 뒷자리 첫 글자는 1~4만 가능합니다.'),
})
  .superRefine((v, ctx) => {
    const now = new Date();
    const yy = v.rrnFront.slice(0, 2);
    const mm = v.rrnFront.slice(2, 4);
    const dd = v.rrnFront.slice(4, 6);

    const mmNum = Number(mm);
    const ddNum = Number(dd);
    if (mmNum < 1 || mmNum > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rrnFront'],
        message: '유효한 월(01~12)을 입력하세요.',
      });
      return;
    }

    const century =
      v.rrnBackFirst === '1' || v.rrnBackFirst === '2' ? 1900 : 2000;

    const fullYear = century + Number(yy);

    const birth = new Date(fullYear, mmNum - 1, ddNum);
    const isValidDate =
      birth.getFullYear() === fullYear &&
      birth.getMonth() === mmNum - 1 &&
      birth.getDate() === ddNum;

    if (!isValidDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rrnFront'],
        message: '존재하지 않는 날짜입니다.',
      });
      return;
    }

    if (birth > now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rrnBackFirst'],
        message:
          '주민등록번호 조합이 출생일과 일치하지 않습니다. (미래 날짜)',
      });
      return;
    }
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
