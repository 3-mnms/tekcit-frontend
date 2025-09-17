import type { SignupFinal } from '@/models/auth/schema/signupSchema'

export function mapToSignupDto(acc: SignupFinal) {
  return {
    loginId: acc.loginId,
    loginPw: acc.loginPw,
    name: acc.name,
    phone: acc.phone,
    email: acc.email,
    userProfile: {
      residentNum: `${acc.rrnFront}-${acc.rrnBackFirst}`,
      address: `${acc.address ?? ''}`.trim(),
      zipCode: acc.zipCode ?? '',
    },
  }
}