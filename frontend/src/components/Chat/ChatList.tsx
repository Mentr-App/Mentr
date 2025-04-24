// components/chat/ChatList.tsx
import React from 'react';
import { Chat } from './types'; // Use renamed interface
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[] | null | undefined; // Allow null/undefined for robustness during loading/error
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteThread: (chatId: string) => void;
  isLoading: boolean; // Optional: Pass loading state for better UI
  error: string | null; // Optional: Pass error state
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteThread,
  isLoading, // Use loading state
  error,     // Use error state
}) => {

  // Log the received prop for debugging
  console.log('ChatList received chats:', chats, 'Type:', typeof chats, 'Is Array:', Array.isArray(chats));
  console.log('ChatList isLoading:', isLoading, 'Error:', error);


  // --- Loading State ---
  if (isLoading) {
    // Optional: Add a loading indicator (e.g., spinner)
    return <div>Loading chats...</div>;
  }

  // --- Error State ---
  if (error) {
    // Display the error message passed from the parent
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // --- Check if chats is an array and has items ---
  // Use Array.isArray() for a reliable check
  if (!Array.isArray(chats) || chats.length === 0) {
    // Provide a clear message when there are no chats or if data is invalid
    return <div className="p-4 text-gray-500">No chats found.</div>;
  }

  // --- Render the list if chats is a valid array with items ---
  return (
    <ul className="divide-y divide-gray-200"> {/* Added some basic styling */}
      {chats.map((chat) => (
        <ChatItem
          // Ensure chat and chat.id exist - might need optional chaining if type allows null/undefined items
          key={chat?._id} // Use _id if that's the actual identifier from MongoDB
          chat={chat}
          isSelected={chat?._id === selectedChatId}
          onSelect={() => chat?._id && onSelectChat(chat._id)} // Check if chat._id exists
          onDelete={() => chat?._id && onDeleteThread(chat._id)} // Check if chat._id exists
        />
      ))}
    </ul>
  );
};

export default ChatList;
