export class LoginWithGoogle {
  email: string;
  accessToken: string;
  provider: string;
  userId: string;

  constructor(accessToken: string, provider: string, userId: string, email: string,) {
    this.email = email;
    this.accessToken = accessToken;
    this.provider = provider;
    this.userId = userId;
  }
}
