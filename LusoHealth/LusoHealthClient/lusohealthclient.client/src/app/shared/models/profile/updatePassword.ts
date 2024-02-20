export interface UpdatePassword {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: Date;
}
