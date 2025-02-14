export interface UserSession {
  userId: string;
  username: string;
  isAdmin: boolean;
  virtualProfileImage?: string;
}

export interface Auth {
  user?: UserSession;
}
