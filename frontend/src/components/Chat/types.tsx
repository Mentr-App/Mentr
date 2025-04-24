// types.ts
export interface User {
    _id: string;
    name: string;
    avatarUrl?: string;
  }
  
  export interface Message {
    _id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    timestamp: Date | string; // Or string
    isOptimistic?: boolean;
    isEdited?: boolean;
  }
  
  export interface Chat {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount?: number;
    // Add other relevant metadata
  }