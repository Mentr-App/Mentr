// components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { Message } from './types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, onDeleteMessage, onEditMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Scroll whenever messages change

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isOwnMessage={msg.senderId === currentUserId}
          onDelete={() => onDeleteMessage(msg.id)}
          onEdit={(newContent) => onEditMessage(msg.id, newContent)} // Pass edit handler
        />
      ))}
      {/* Dummy div to help scrolling to the bottom */}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;