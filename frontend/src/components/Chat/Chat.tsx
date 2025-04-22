// components/chat/Chat.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatView from './ChatView';
import NewChatModal from './NewChatModal'; // Import the new modal
import { Chat, User } from './types'; // Import User type
import { findOrCreateChat } from './ChatApi'; // Import new API function

const ChatComponent: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false); // State for modal visibility
  const [isProcessingNewChat, setIsProcessingNewChat] = useState(false); // State for loading indicator after selection

  // --- Data Fetching ---
  useEffect(() => {
    const loadChats = async () => {
      // ... (loading logic as before) ...
       setIsLoading(true);
       setError(null);
       try {
         // const fetchedChats = await fetchChats(); // Assume this fetches existing chats
         const fetchedChats: Chat[] = await new Promise(resolve => setTimeout(() => resolve([
             { id: 'chat1', participants: [{ id: 'user2', name: 'Alice Mentee'}], lastMessage: { id: 'msg1', senderId: 'user2', sender: {id: 'user2', name: 'Alice Mentee'}, content: 'Hey there!', timestamp: new Date(Date.now() - 100000) } },
             { id: 'chat2', participants: [{ id: 'user3', name: 'Bob Mentor'}], lastMessage: { id: 'msg2', senderId: 'currentUser', sender: {id: 'currentUser', name: 'You'}, content: 'Sounds good, let\'s talk tomorrow. asdfadsfdasfdasfdsafdsafdasfdsafdsafdsafdsfasfds', timestamp: new Date(Date.now() - 2000000) } },
         ]), 1000));
         setChats(fetchedChats);
       } catch (err) {
         console.error("Failed to fetch chats:", err);
         setError("Could not load chats.");
       } finally {
         setIsLoading(false);
       }
    };
    loadChats();
  }, []);

  // --- Event Handlers ---
  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    setIsCreatingChat(false); // Close modal if open when a chat is selected
  }, []);

  // Open the modal
  const handleCreateNewChat = useCallback(() => {
    setIsCreatingChat(true);
  }, []);

  // Close the modal
  const handleCloseNewChatModal = useCallback(() => {
    setIsCreatingChat(false);
  }, []);

  // Handle user selection from the modal
  const handleStartChatWithUser = useCallback(async (selectedUser: User) => {
    setIsProcessingNewChat(true);
    handleCloseNewChatModal(); // Close modal immediately

    try {
      // 1. Check if a chat with this user already exists locally
      const existingChat = chats.find(chat =>
        chat.participants.length === 2 && // Ensure it's a 1-on-1 chat
        chat.participants.some(p => p.id === selectedUser.id) &&
        chat.participants.some(p => p.id === 'currentUser') // Replace 'currentUser' with actual ID
      );

      if (existingChat) {
        // 2a. If chat exists, just select it
        setSelectedChatId(existingChat.id);
        console.log(`Found existing chat: ${existingChat.id}`);
      } else {
        // 2b. If chat doesn't exist, call API to find/create it
        console.log(`No local chat found. Calling findOrCreateChat for user ${selectedUser.id}`);
        const newOrExistingChat = await findOrCreateChat(selectedUser.id);

        // 3. Update local chats state if it's a new chat not already present
        setChats(prevChats => {
             // Check again if the chat returned by API is already in our state
             // (in case it was created between the local check and API response)
             if (prevChats.some(c => c.id === newOrExistingChat.id)) {
                 return prevChats;
             }
             // Add the new chat to the beginning of the list
             return [newOrExistingChat, ...prevChats];
        });

        // 4. Select the new/existing chat
        setSelectedChatId(newOrExistingChat.id);
        console.log(`Selected new/existing chat: ${newOrExistingChat.id}`);
      }
    } catch (err) {
      console.error("Failed to start or find chat:", err);
      // Optionally show an error message to the user (e.g., using a toast notification library)
      alert(`Could not start chat with ${selectedUser.name}. Please try again.`);
      setError(`Could not start chat with ${selectedUser.name}.`); // Set error state
    } finally {
      setIsProcessingNewChat(false);
    }
  }, [chats]); // Dependency on current chats list

   const handleDeleteThread = useCallback(async (chatId: string) => {
    // ... (delete logic as before) ...
        const confirmDelete = window.confirm("Are you sure you want to remove this chat from your view? This cannot be undone for you, but others will still see it.");
        if (confirmDelete) {
            try {
                // await deleteChatForUser(chatId);
                console.log(`Deleting chat ${chatId} for current user (API call simulation)`);
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (selectedChatId === chatId) {
                    setSelectedChatId(null);
                }
                alert(`Chat ${chatId} removed from your view.`);
            } catch (err) {
                console.error("Failed to delete chat thread:", err);
                alert("Could not remove chat. Please try again.");
            }
        }
   }, [selectedChatId]);

  // --- Rendering ---
  return (
    <div className="flex h-full w-full text-gray-50 relative"> {/* Add relative for potential absolute loading indicator */}
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={handleCreateNewChat} // Passed down to button
        onDeleteThread={handleDeleteThread}
        isLoading={isLoading} // Loading indicator for initial chat list load
      />
      <ChatView
        key={selectedChatId}
        selectedChatId={selectedChatId}
        // currentUserId="currentUser"
      />

      {/* Render the modal */}
      <NewChatModal
        isOpen={isCreatingChat}
        onClose={handleCloseNewChatModal}
        onUserSelect={handleStartChatWithUser} // Pass the handler
        // currentUserId="currentUser" // Pass actual current user ID
      />

      {/* Optional: Loading indicator while processing new chat creation */}
      {isProcessingNewChat && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="text-white text-lg">Starting chat...</div>
              {/* Or use a spinner component */}
          </div>
      )}
    </div>
  );
};

export default ChatComponent;