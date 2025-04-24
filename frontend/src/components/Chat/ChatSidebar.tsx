// components/chat/ChatSidebar.tsx
import React from 'react';
import { Chat } from './types';
import ChatList from './ChatList';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: () => void;
  onDeleteThread: (chatId: string) => void;
  isLoading: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateNewChat,
  onDeleteThread,
  isLoading,
}) => {
  return (
    // Use the secondary dark background, specify width, add right border
    <div className="w-1/3 md:w-1/4 h-full bg-[#262d34] border-r border-[#343b45] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#343b45]">
        <h2 className="text-lg font-semibold text-gray-50">Chats</h2>
      </div>

      {/* New Chat Button */}
      <div className="p-2 border-b border-[#343b45]">
         <button
            onClick={onCreateNewChat}
            // Use primary orange colors, white text
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
         >
            New Chat
         </button>
      </div>

      {/* Chat List Area */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Loading chats...</div> // Use light text
        ) : chats.length === 0 ? (
           <div className="p-4 text-center text-gray-400">
             No chats yet. Start a new one!
           </div> // Use light text
        ) : (
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={onSelectChat}
            onDeleteThread={onDeleteThread}
            isLoading={false}
            error={""}
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;