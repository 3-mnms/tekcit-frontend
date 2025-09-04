// src/models/captcha/captchaTypes.ts
export type CaptchaResponseDTO = {
  success: boolean;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFail = {
  success: false;
  message?: string;
  errorCode?: string;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFail;
