import { LastMessage } from "./message.type"

// export interface LastMessage {
//   senderId: string;
//   receiverId: string;
//   text?: string;
//   fileName?: string;
//   fileType?: string;

//   attachments?: {
//     fileName: string;
//     fileType: string;
//   }[];

//   createdAt: string;
// }


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

  // Frontend helpers
  isBlocked?: boolean;
  hasBlockedMe?: boolean;

  // Sidebar
  lastMessage?: LastMessage | null;
}

