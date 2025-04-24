// components/chat/Chat.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatView from './ChatView';
import NewChatModal from './NewChatModal'; // Import the new modal
import { Chat, User } from './types'; // Import User type
import { findOrCreateChat, fetchChats } from './ChatApi'; // Import new API function

const ChatComponent: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false); // State for modal visibility
  const [isProcessingNewChat, setIsProcessingNewChat] = useState(false); // State for loading indicator after selection
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    setUserId(storedUserId)
  }, [])

  // --- Data Fetching ---
  useEffect(() => {
    const loadChats = async () => {
       setIsLoading(true);
       setError(null); // Reset error state
       try {
         // fetchChats now returns Chat[] on success or throws an error
         const fetchedChats = await fetchChats();
         setChats(fetchedChats);
       } catch (err) {
         // Catch block now correctly handles errors thrown from fetchChats
         console.error("loadChats: Failed to fetch chats:", err);
         // Set a user-friendly error message based on the error caught
         if (err instanceof Error) {
            // You could customize the message further based on err.message
            setError(`Could not load chats: ${err.message}`);
         } else {
            setError("Could not load chats due to an unknown error.");
         }
         setChats([]); // Ensure chats is empty on error
       } finally {
         setIsLoading(false);
       }
    };
    loadChats();
  }, []); // Empty dependency array ensures it runs once on mount

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
      const userId = localStorage.getItem("userId")

      // 1. Check if a chat with this user already exists locally
      const existingChat = chats.find(chat =>
        chat.participants.length === 2 && // Ensure it's a 1-on-1 chat
        chat.participants.some(p => p._id === selectedUser._id) &&
        chat.participants.some(p => p._id === userId) // Replace 'currentUser' with actual ID
      );

      if (existingChat) {
        // 2a. If chat exists, just select it
        setSelectedChatId(existingChat._id);
        console.log(`Found existing chat: ${existingChat._id}`);
      } else {
        // 2b. If chat doesn't exist, call API to find/create it
        console.log(`No local chat found. Calling findOrCreateChat for user ${selectedUser._id}`);
        const newOrExistingChat = await findOrCreateChat(selectedUser._id);

        // 3. Update local chats state if it's a new chat not already present
        setChats(prevChats => {
             // Check again if the chat returned by API is already in our state
             // (in case it was created between the local check and API response)
             if (prevChats.some(c => c._id === newOrExistingChat._id)) {
                 return prevChats;
             }
             // Add the new chat to the beginning of the list
             return [newOrExistingChat, ...prevChats];
        });

        // 4. Select the new/existing chat
        setSelectedChatId(newOrExistingChat._id);
        console.log(`Selected new/existing chat: ${newOrExistingChat._id}`);
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
                setChats(prev => prev.filter(c => c._id !== chatId));
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
        chats={chats}
        selectedChatId={selectedChatId}
        currentUserId={userId}
      />

      {/* Render the modal */}
      <NewChatModal
        isOpen={isCreatingChat}
        onClose={handleCloseNewChatModal}
        onUserSelect={handleStartChatWithUser} // Pass the handler
        currentUserId={userId} // Pass actual current user ID
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