export const AUTH_CLIENT = 'AUTH_CLIENT';

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: number;
  email: string;
  role: string;
  error?: string;
}

export interface IAuthClient {
  validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse>;
}
