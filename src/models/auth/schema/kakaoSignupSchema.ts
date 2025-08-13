import { z } from 'zod';

export const kakaoStep2Schema = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  phone: z
    .string()
    .regex(/^01[016789]-\d{3,4}-\d{4}$/, '전화번호 형식: 010-1234-5678'),
});

export type KakaoStep2 = z.infer<typeof kakaoStep2Schema>;

export const kakaoStep3Schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  zipcode: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
});

export type KakaoStep3 = z.infer<typeof kakaoStep3Schema>;

export interface KakaoSignupDTO {
  name: string;
  phone: string;
  userProfile?: {
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    zipcode?: string;
    address1?: string;
    address2?: string;
  };
}
