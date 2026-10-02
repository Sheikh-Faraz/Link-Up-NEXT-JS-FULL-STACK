export interface User {
  UserId: string;
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  about?: string;
  blockedUsers: string[];
  isDeletedFor: string[];
  provider?: string;
  createdAt: string;

  // 🔥 ADD THESE (frontend-only helpers)
  isBlocked?: boolean;     // I blocked them
  hasBlockedMe?: boolean;  // they blocked me
}