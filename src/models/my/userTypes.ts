export type UserRole = 'USER' | 'HOST' | 'ADMIN';
export type OAuthProvider = 'LOCAL' | 'KAKAO';
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';

export type AddressDTO = {
  name: string;
  phone: string;
  address: string;
  zipCode: string;
  isDefault: boolean;
};

export type MyPageCommonDTO = {
  loginId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: string;  
  updatedAt: string;  
  oauthProvider: OAuthProvider;
};

export type MyPageUserDTO = MyPageCommonDTO & {
  residentNum: string;  
  birth: string;      
  gender: UserGender;
  age: number;
  addresses: AddressDTO[];
};

export type MyPageHostDTO = MyPageCommonDTO & {
  businessName: string;
};

export type MyPageUnionDTO = MyPageUserDTO | MyPageHostDTO | MyPageCommonDTO;

export type UpdateUserRequestDTO = {
  name?: string;
  phone?: string;
  residentNum?: string;  
};

export type UpdateUserResponseDTO = {
  loginId: string;
  name: string;
  phone: string;
  updatedAt: string;      
  oauthProvider: OAuthProvider;

  residentNum?: string;
  birth?: string;
  gender?: UserGender;
  age?: number;
};

export type CheckPwDTO = { password: string };
export type ResetPwDTO = { newPassword: string };

export const isUser = (d: MyPageUnionDTO): d is MyPageUserDTO =>
  (d as MyPageUserDTO).residentNum !== undefined && (d as MyPageUserDTO).addresses !== undefined;

export const isHost = (d: MyPageUnionDTO): d is MyPageHostDTO =>
  (d as MyPageHostDTO).businessName !== undefined;
