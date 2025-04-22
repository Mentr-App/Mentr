// types.ts
export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
  }
  
  export interface Message {
    id: string;
    senderId: string;
    sender: User;
    content: string;
    timestamp: Date; // Or string
    isEdited?: boolean;
  }
  
  // Renamed from Conversation to Chat
  export interface Chat {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount?: number;
    // Add other relevant metadata
  }