export interface Role {
  id: string | number;
  name: string;
}

export interface User {
  id: string;
  username: string;
  isDemoUser: boolean;
  isVerified: boolean;
  isRootUser: boolean;
  needsPasswordChange: boolean;
  createdAt: string;
  roles: string[];
}
