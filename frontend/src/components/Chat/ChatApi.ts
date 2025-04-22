// lib/chatApi.ts - Placeholder functions
import { Chat, Message, User } from './types'; // Use renamed Chat interface

// NOTE: Replace all these with actual fetch() calls to your backend endpoints

export const fetchChats = async (): Promise<Chat[]> => { // Renamed function
  console.log("API Call: fetchChats"); // Updated log
  // Example: const response = await fetch('/api/chats'); // Updated endpoint example
  // if (!response.ok) throw new Error('Network response was not ok');
  // return response.json();
  await new Promise(resolve => setTimeout(resolve, 500));
   return [ /* Return dummy or fetched chat data */ ];
};

export const fetchMessagesForChat = async (chatId: string): Promise<Message[]> => { // Renamed function and parameter
   console.log(`API Call: fetchMessagesForChat(${chatId})`); // Updated log
   // Example: const response = await fetch(`/api/chats/${chatId}/messages`); // Updated endpoint example
   await new Promise(resolve => setTimeout(resolve, 300));
   return [ /* Return dummy or fetched message data */ ];
};

// sendMessage might take chatId instead of conversationId
export const sendMessage = async (chatId: string, content: string): Promise<Message> => { // Renamed parameter
  console.log(`API Call: sendMessage to chat ${chatId} ("${content}")`); // Updated log
  // Example: const response = await fetch(`/api/chats/${chatId}/messages`, { // Updated endpoint example
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ content }),
  // });
  // if (!response.ok) throw new Error('Failed to send');
  // return response.json();
   await new Promise(resolve => setTimeout(resolve, 200));
   return { id: `server-${Date.now()}`, senderId: 'currentUser', sender: {id: 'currentUser', name: 'You'}, content, timestamp: new Date() };
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  console.log(`API Call: deleteMessage(${messageId})`);
  // Example: const response = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' }); // Endpoint might be message-specific
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const editMessage = async (messageId: string, newContent: string): Promise<Message> => {
    console.log(`API Call: editMessage(${messageId}, "${newContent}")`);
    // Example: const response = await fetch(`/api/messages/${messageId}`, { // Endpoint might be message-specific
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: newContent }),
    // });
    // if (!response.ok) throw new Error('Failed to edit');
    // return response.json();
     await new Promise(resolve => setTimeout(resolve, 300));
     return { id: messageId, senderId: 'currentUser', sender: {id: 'currentUser', name: 'You'}, content: newContent, timestamp: new Date(), isEdited: true };
};

export const deleteChatForUser = async (chatId: string): Promise<void> => { // Renamed function and parameter
    console.log(`API Call: deleteChatForUser(${chatId})`); // Updated log
    // Marks the chat as hidden/archived for the current user
    // Example: const response = await fetch(`/api/chats/${chatId}/hide`, { method: 'POST' }); // Updated endpoint example
    // if (!response.ok) throw new Error('Failed to hide chat');
    await new Promise(resolve => setTimeout(resolve, 400));
};

export const fetchChatDetails = async (chatId: string): Promise<Chat> => { // Renamed function
    console.log(`API Call: fetchChatDetails(${chatId})`); // Updated log
    // Example: const response = await fetch(`/api/chats/${chatId}`); // Updated endpoint example
    // if (!response.ok) throw new Error('Failed to fetch chat details');
    // return response.json();
    await new Promise(resolve => setTimeout(resolve, 200));
    // Return dummy or fetched chat details
    return { id: chatId, participants: [{id: 'someUser', name:'Fetched User'}], lastMessage: undefined };
}

// Add functions for creating new chats, fetching user details, etc.

/**
 * Searches for users based on a query string (e.g., username).
 * In a real app, this would hit a backend endpoint like /api/users/search?q=query
 */
 export const searchUsers = async (query: string): Promise<User[]> => {
  console.log(`API Call: searchUsers("${query}")`);
  if (!query.trim()) {
    return []; // Return empty if query is empty
  }
  // Simulate API delay and filtering dummy users
  await new Promise(resolve => setTimeout(resolve, 300));
  const dummyUsers: User[] = [
    { id: 'user2', name: 'Alice Mentee', avatarUrl: undefined },
    { id: 'user3', name: 'Bob Mentor', avatarUrl: undefined },
    { id: 'user4', name: 'Charlie User', avatarUrl: undefined },
    { id: 'user5', name: 'Alicia Keys', avatarUrl: undefined }, // Example duplicate first name
  ];
  const lowerCaseQuery = query.toLowerCase();
  return dummyUsers.filter(user =>
    user.name.toLowerCase().includes(lowerCaseQuery) &&
    user.id !== 'currentUser' // Don't let users search for themselves (example)
  );
};

/**
 * Finds an existing chat with the given user or creates a new one.
 * The backend should handle the logic of checking for existence before creating.
 * It should return the chat (either existing or newly created).
 */
export const findOrCreateChat = async (otherUserId: string): Promise<Chat> => {
  console.log(`API Call: findOrCreateChat(otherUserId: ${otherUserId})`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // In a real backend, you'd check if a chat exists between currentUser and otherUserId.
  // If yes, return that Chat object.
  // If no, create a new Chat object, save it, and return it.

  // Simulate finding/creating: Return a dummy chat object
  // This assumes the backend returns the full chat object including participants.
  const selectedUser = (await searchUsers(otherUserId))[0] || { id: otherUserId, name: 'Unknown User' }; // Fetch user details just for the example name
  const currentUser: User = { id: 'currentUser', name: 'You' }; // Get current user properly in real app

  return {
    id: `chat-${Date.now()}`, // Generate a pseudo-unique ID for the example
    participants: [currentUser, selectedUser],
    lastMessage: undefined, // New chats usually don't have a last message
  };
};