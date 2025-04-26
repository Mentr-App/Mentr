// components/chat/ChatView.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message, Chat, User } from './types';
import { fetchMessagesForChat, fetchChatDetails, sendMessage, deleteMessage, editMessage } from './ChatApi';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useAuth } from '../../contexts/AuthContext';

interface ChatViewProps {
  selectedChatId: string | null;
  chats: Chat[];
  currentUserId?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ selectedChatId, chats, currentUserId}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const { sendMessage, editMessage, deleteMessage } = useChatSocket({
    token,
    chatId: selectedChatId,
    onReceiveMessage: (msg) => {
      setMessages((prev) => {
        if (msg && prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    },
    onEditReceived: (new_msg) => {
      setMessages(prevMessages => 
        prevMessages.map(msg =>
          msg._id === new_msg._id
            ? new_msg
            : msg
        )  
      )
    },
    onDeleteReceived: (deleted_msg) => {
      setMessages(prevMessages => 
        prevMessages.filter(msg =>
          msg._id !== deleted_msg
        )  
      )
    },
    enabled: isAuthenticated && !!token && !!selectedChatId,
  });




  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setChatDetails(null);
      return;
    }
    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedMessages = await fetchMessagesForChat(selectedChatId);
        // const fetchedDetails = await fetchChatDetails(selectedChatId);
        console.log(`Messages for chat ${selectedChatId}`);
        setMessages(fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        // setChatDetails(fetchedDetails);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Could not load messages.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [selectedChatId]);

  const handleSendMessage = useCallback(
    (content: string) => {
      const userId = localStorage.getItem('userId');
      if (!selectedChatId || !content.trim() || !userId) {
        console.warn('handleSendMessage: Missing required data (chatId, content, userId, user).');
        return;
      }
      const trimmedContent = content.trim();
    
      sendMessage(trimmedContent);
    },
    [selectedChatId, sendMessage]
  );

  const handleDeleteMessage = useCallback(async (messageId: string) => {
     const messageToDelete = messages.find(msg => msg._id === messageId);
     if (!messageToDelete || messageToDelete.sender_id !== currentUserId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this message? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      deleteMessage(messageId)
    } catch (err) {
      console.error("Failed to delete message:", err); setError("Could not delete message.");
    }
  }, [messages, currentUserId]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    const messageToEdit = messages.find(msg => msg._id === messageId);

    // --- Validations ---
    if (!messageToEdit) return; // Message not found
    if (!currentUserId || messageToEdit.sender_id !== currentUserId) {
        setError("You can only edit your own messages.");
        return; // Not the sender
    }
    const trimmedContent = newContent.trim();
    if (!trimmedContent) {
        setError("Message content cannot be empty.");
        return; // Content required
    }
    if (trimmedContent === messageToEdit.content) {
        return; // No actual change
    }
    // --- End Validations ---

    const originalContent = messageToEdit.content;
    const originalIsEdited = messageToEdit.isEdited; // Store original state for rollback

    // Optimistic UI Update: Show the change immediately
    setMessages(prev =>
        prev.map(msg =>
            msg._id === messageId
                ? { ...msg, content: trimmedContent, isEdited: true } // Apply edit locally
                : msg
        )
    );
    setError(null); // Clear previous errors

    try {
        // Call the hook function to emit the 'edit_message' event via WebSocket.
        // This does not return the updated message directly.
        editMessage(messageId, trimmedContent);

        // The actual confirmation and final state update will come via the
        // 'onEditedMessage' callback provided to the useChatSocket hook.

    } catch (err) {
        // Catch synchronous errors (e.g., during optimistic update).
        // This does NOT catch async errors from the server response.
        console.error("Failed to initiate message edit:", err);
        setError("Could not start message edit process.");

        // Rollback Optimistic Update on sync error
        setMessages(prev =>
            prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, content: originalContent, isEdited: originalIsEdited } // Revert to original
                    : msg
            )
        );
    }
}, [messages, currentUserId, setMessages, setError, editMessage]); // useCallback dependencies

    const getOtherParticipantName = (participants: User[]): string => {
      const currentUserId = localStorage.getItem("userId");
      const otherParticipant = participants.find(p => p._id !== currentUserId);
      return otherParticipant?.name || 'Unknown User';
  };


  if (!selectedChatId) {
    return (
      // Use foreground background, light text for placeholder
      <div className="flex-grow flex items-center justify-center bg-[#2c343c] text-gray-400">
        Select a chat to start messaging.
      </div>
    );
  }

  return (
    // Use foreground background for the main view area
    <div className="flex-grow flex flex-col h-full bg-[#2c343c]">
      {/* Chat Header - Use secondary dark background */}
      <div className="p-4 border-b border-[#343b45] bg-[#262d34]">
        <h2 className="font-semibold text-gray-50">
            Chat with {getOtherParticipantName(chats.filter((chat) => chat._id === selectedChatId)[0].participants)}
        </h2>
      </div>

      {/* Message List area takes remaining space */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading messages...</div> // Light text
        ) : error ? (
            <div className="text-center text-red-400">{error}</div> // Use specific error color
        ) : messages.length === 0 ? (
            <div className="text-center text-gray-400">No messages in this chat yet.</div> // Light text
        ) : (
            <MessageList
                messages={messages}
                currentUserId={currentUserId}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
            />
        )}
      </div>

      {/* Message Input area - Use secondary dark background */}
      <div className="p-4 border-t border-[#343b45] bg-[#262d34]">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatView;