export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  isDemoUser: boolean;
  isVerified: boolean;
  isRootUser: boolean;
  needsPasswordChange: boolean;
  createdAt: string;
  roles: string[];
}
