// components/chat/ChatList.tsx
import React from 'react';
import { Chat } from './types'; // Use renamed interface
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[]; // Renamed prop
  selectedChatId: string | null; // Renamed prop
  onSelectChat: (chatId: string) => void; // Renamed prop
  onDeleteThread: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteThread,
}) => {
  return (
    <ul>
      {chats.map((chat) => ( // Use 'chat' instead of 'convo'
        <ChatItem
          key={chat.id}
          chat={chat} // Pass the individual chat object
          isSelected={chat.id === selectedChatId} // Compare with renamed prop
          onSelect={() => onSelectChat(chat.id)} // Call renamed handler
          onDelete={() => onDeleteThread(chat.id)}
        />
      ))}
    </ul>
  );
};

export default ChatList;