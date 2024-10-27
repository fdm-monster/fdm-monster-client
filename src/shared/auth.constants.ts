export interface PermissionDeniedEvent {
  roles?: string[];
  permissions?: string[];
  error?: string;
  url?: string;
}

export const AUTH_ERROR_REASON = {
  IncorrectCredentials: "IncorrectCredentials",
  InvalidOrExpiredRefreshToken: "InvalidOrExpiredRefreshToken",
  InvalidOrExpiredAuthToken: "InvalidOrExpiredAuthToken",
  PasswordChangeRequired: "PasswordChangeRequired",
  LoginRequired: "LoginRequired",
  AccountNotVerified: "AccountNotVerified",
};

export function convertAuthErrorReason(error: string) {
  switch (error) {
    case AUTH_ERROR_REASON.IncorrectCredentials:
      return "Incorrect credentials";
    case AUTH_ERROR_REASON.InvalidOrExpiredRefreshToken:
      return "Invalid or expired refresh token";
    case AUTH_ERROR_REASON.InvalidOrExpiredAuthToken:
      return "Invalid or expired auth token";
    case AUTH_ERROR_REASON.PasswordChangeRequired:
      return "Password change required";
    case AUTH_ERROR_REASON.LoginRequired:
      return "Login required";
    case AUTH_ERROR_REASON.AccountNotVerified:
      return "Account not verified";
    default:
      return "Authentication error";
  }
}
