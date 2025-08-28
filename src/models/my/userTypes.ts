// 공통 열거형
export type UserRole = 'USER' | 'HOST' | 'ADMIN';
export type OAuthProvider = 'LOCAL' | 'KAKAO';
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';

// 주소
export type AddressDTO = {
  name: string;
  phone: string;
  address: string;
  zipCode: string;
  isDefault: boolean;
};

// 공통 DTO (ADMIN 포함)
export type MyPageCommonDTO = {
  loginId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: string;     // LocalDateTime → ISO string
  updatedAt: string;     // LocalDateTime → ISO string
  oauthProvider: OAuthProvider;
};

// USER 전용
export type MyPageUserDTO = MyPageCommonDTO & {
  residentNum: string;   // "YYMMDD-#"
  birth: string;         // "YYYY-MM-DD" 혹은 "YYYY.MM.DD" 서버 형식 그대로
  gender: UserGender;
  age: number;
  addresses: AddressDTO[];
};

// HOST 전용
export type MyPageHostDTO = MyPageCommonDTO & {
  businessName: string;
};

// 서버에서 /userInfo 는 Role 에 따라 union 으로 옴
export type MyPageUnionDTO = MyPageUserDTO | MyPageHostDTO | MyPageCommonDTO;

// Update 요청 (서버 DTO에 맞춰 필드만 포함/선택적으로 보냄)
export type UpdateUserRequestDTO = {
  name?: string;
  phone?: string;

  // USER 전용(있는 경우만 보냄)
  residentNum?: string;  // "YYMMDD-#"
  birth?: string;        // "YYYY-MM-DD"
  gender?: UserGender;
};

export type UpdateUserResponseDTO = {
  loginId: string;
  name: string;
  phone: string;
  updatedAt: string;       // LocalDateTime
  oauthProvider: OAuthProvider;

  // USER 전용 필드들(ADMIN/HOST도 올 수 있으니 optional)
  residentNum?: string;
  birth?: string;
  gender?: UserGender;
  age?: number;
};

// 비밀번호 확인/재설정
export type CheckPwDTO = { password: string };
export type ResetPwDTO = { newPassword: string };

// 타입 가드(원하면 사용)
export const isUser = (d: MyPageUnionDTO): d is MyPageUserDTO =>
  (d as MyPageUserDTO).residentNum !== undefined && (d as MyPageUserDTO).addresses !== undefined;

export const isHost = (d: MyPageUnionDTO): d is MyPageHostDTO =>
  (d as MyPageHostDTO).businessName !== undefined;
