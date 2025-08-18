// src/models/auth/schema/kakaoSignupSchema.ts
import { z } from 'zod';

// step2: 이름/전화 + 주민번호 앞6자리/뒷1자리(서버에서도 재검증)
export const kakaoStep2Schema = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  phone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '전화번호 형식: 010-1234-5678'),
  rrnFront: z.string().regex(/^\d{6}$/, '주민번호 앞 6자리'),
  rrnBackFirst: z.string().regex(/^[1-4]$/, '주민번호 뒷 첫자리(1~4)'),
});

export type KakaoStep2 = z.infer<typeof kakaoStep2Schema>;

// step3: 주소/성별/생일
export const kakaoStep3Schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  zipCode: z.string().optional(),       // ✅ zipCode 로 통일
  address: z.string().optional(),       // ✅ address 로 통일(= address1)
  detailAddress: z.string().optional(), // ✅ detailAddress 로 통일(= address2)
});

export type KakaoStep3 = z.infer<typeof kakaoStep3Schema>;

// 서버 DTO (백엔드와 합의된 스펙 유지)
export interface KakaoSignupDTO {
  name: string;
  phone: string;
  userProfile: {
    residentNum: string; // "990101-1"
    address: string;     // address + detailAddress 합친 값
    zipCode: string;
  };
}

// DTO 빌더 (acc2/acc3 -> 서버 DTO)
export function buildKakaoSignupDTO(
  acc2: Partial<KakaoStep2>,
  acc3: Partial<KakaoStep3>
): KakaoSignupDTO {
  const residentNum = `${acc2.rrnFront ?? ''}-${acc2.rrnBackFirst ?? ''}`;
  const mergedAddress = [acc3.address || '', acc3.detailAddress || '']
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    name: acc2.name ?? '',
    phone: acc2.phone ?? '',
    userProfile: {
      residentNum,
      address: mergedAddress,
      zipCode: acc3.zipCode || '',
    },
  };
}