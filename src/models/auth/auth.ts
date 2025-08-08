export interface SignupUserDTO {
  loginId: string;
  loginPw: string;
  name: string;
  phone: string;
  email: string;
  userProfile: {
    residentNum: string;
    address: string;
  };
  hostProfile?: {
    businessName: string;
    genre?: string;
  };
}
