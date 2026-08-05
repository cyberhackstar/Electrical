export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
