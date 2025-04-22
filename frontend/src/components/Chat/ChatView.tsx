// components/chat/ChatView.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message, Chat } from './types';
// import { fetchMessagesForChat, fetchChatDetails, sendMessage, deleteMessage, editMessage } from '@/lib/chatApi';

interface ChatViewProps {
  selectedChatId: string | null;
  currentUserId?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ selectedChatId, currentUserId = "currentUser" }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... (Data fetching and handlers remain the same) ...
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
        // const fetchedMessages = await fetchMessagesForChat(selectedChatId);
        // const fetchedDetails = await fetchChatDetails(selectedChatId);
        console.log(`Workspaceing messages for chat ${selectedChatId}`);
        const fetchedMessages: Message[] = await new Promise(resolve => setTimeout(() => resolve([
             { id: 'msg1', senderId: 'user2', sender: {id: 'user2', name: 'Alice Mentee'}, content: 'Hey there!', timestamp: new Date(Date.now() - 100000) },
             { id: 'msg2', senderId: 'currentUser', sender: {id: 'currentUser', name: 'You'}, content: 'Sounds good, let\'s talk tomorrow.', timestamp: new Date(Date.now() - 200000) },
             { id: 'msg3', senderId: 'user2', sender: {id: 'user2', name: 'Alice Mentee'}, content: 'Great!', timestamp: new Date(Date.now() - 50000) },
             { id: 'msg4', senderId: 'currentUser', sender: {id: 'currentUser', name: 'You'}, content: 'Perfect.', timestamp: new Date(Date.now() - 10000), isEdited: true},
        ].filter(m => selectedChatId === 'chat1' ? m.senderId !== 'user3' : m.senderId !== 'user2')
        ), 500));
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

  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedChatId || !content.trim()) return;
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, senderId: currentUserId, sender: { id: currentUserId, name: 'You' }, content: content.trim(), timestamp: new Date(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    try {
      // const sentMessage = await sendMessage(selectedChatId, content.trim());
       const sentMessage: Message = await new Promise(resolve => setTimeout(() => resolve({ ...optimisticMessage, id: `server-${Date.now()}` }), 300));
      setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg));
    } catch (err) {
      console.error("Failed to send message:", err); setError("Message failed to send.");
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  }, [selectedChatId, currentUserId]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
     const messageToDelete = messages.find(msg => msg.id === messageId);
     if (!messageToDelete || messageToDelete.senderId !== currentUserId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this message? This cannot be undone.");
    if (!confirmDelete) return;
    try {
        // await deleteMessage(messageId);
        console.log(`Deleting message ${messageId} (API call simulation)`);
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
         alert("Message deleted.");
    } catch (err) {
        console.error("Failed to delete message:", err); setError("Could not delete message.");
    }
  }, [messages, currentUserId]);

   const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
        const messageToEdit = messages.find(msg => msg.id === messageId);
        if (!messageToEdit || messageToEdit.senderId !== currentUserId) return;
        if (!newContent.trim() || newContent.trim() === messageToEdit.content) return;
        const originalContent = messageToEdit.content;
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: newContent.trim(), isEdited: true } : msg ));
        try {
            // const updatedMessage = await editMessage(messageId, newContent.trim());
            console.log(`Editing message ${messageId} to "${newContent.trim()}" (API call simulation)`);
             const updatedMessage: Message = await new Promise(resolve => setTimeout(() => resolve({ ...messageToEdit, content: newContent.trim(), isEdited: true, timestamp: new Date() }), 300));
            setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
             alert("Message edited.");
        } catch (err) {
            console.error("Failed to edit message:", err); setError("Could not edit message.");
             setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: originalContent, isEdited: messageToEdit.isEdited } : msg ));
        }
    }, [messages, currentUserId]);


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
            Chat with ... {/* Placeholder */}
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