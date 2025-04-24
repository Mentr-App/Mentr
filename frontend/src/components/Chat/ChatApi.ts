// lib/chatApi.ts - Placeholder functions
import { Chat, Message, User } from './types'; // Use renamed Chat interface

// Define optional pagination parameters
interface FetchMessagesParams {
  limit?: number;
  skip?: number;
}

// NOTE: Replace all these with actual fetch() calls to your backend endpoints

export const fetchChats = async (): Promise<Chat[]> => {
  console.log("API Call: fetchChats");

  // 1. Guard localStorage access
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  if (!token) {
    console.error("fetchChats: Auth token not found.");
    // 2. Throw error instead of returning []
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await fetch("/api/chat/getChats", { // Ensure this endpoint is correct
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("fetchChats: Successfully fetched chats.", data);
      return data.chats; // Return data on success
    } else {
      // 2. Throw error for non-OK responses
      console.error("fetchChats: Error occurred - Status:", response.status, response.statusText);
      // Include status text for more context
      throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // 2. Re-throw network or other errors
    console.error("fetchChats: Network or other error occurred:", error);
    // Check if it's already an Error object, otherwise wrap it
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error('An unknown error occurred during fetchChats.');
    }
  }
};

export const fetchMessagesForChat = async (
  chatId: string,
  params?: FetchMessagesParams
): Promise<Message[]> => {
  console.log(`API Call: fetchMessagesForChat(chatId: ${chatId}, params: ${JSON.stringify(params)})`);

  // 1. Validate chatId
  if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
    console.error("fetchMessagesForChat: Invalid chatId provided.");
    throw new Error("Invalid chat ID provided.");
  }

  // 2. Get the authentication token (handle SSR)
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  if (!token) {
    console.error("fetchMessagesForChat: Auth token not found in localStorage.");
    throw new Error("Authentication token not found. Please log in.");
  }

  try {
    // 3. Construct the URL with path parameter and optional query parameters
    // Assuming a Next.js API route like /api/chat/[chatId]
    const urlPath = `/api/chat/${chatId.trim()}`;
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) {
      queryParams.set('limit', String(params.limit));
    }
    if (params?.skip !== undefined) {
      queryParams.set('skip', String(params.skip));
    }
    const url = `${urlPath}?${queryParams.toString()}`;

    console.log(`fetchMessagesForChat: Fetching from URL: ${url}`);

    // 4. Make the authenticated GET request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Common practice, though GET has no body
      },
    });

    // 5. Handle the response
    const responseBody = await response.json(); // Assume JSON response

    if (response.ok) {
      console.log(`fetchMessagesForChat: Successfully fetched messages for chat ${chatId}:`, responseBody);
      // Add validation here if needed to ensure responseBody is Message[]
      if (!Array.isArray(responseBody)) {
           throw new Error("API response is not a valid array of Messages.");
      }
      return responseBody as Message[]; // Return the array of messages
    } else {
      // Handle HTTP errors
      const errorMsg = responseBody?.message || responseBody?.msg || `Failed to fetch messages: ${response.status} ${response.statusText}`;
      console.error(`fetchMessagesForChat: API request failed - Status: ${response.status}`, responseBody);
      throw new Error(errorMsg);
    }
  } catch (error) {
    // Handle network errors or errors during fetch/JSON parsing
    console.error("fetchMessagesForChat: Network or other error occurred:", error);
    if (error instanceof Error) {
        if (error.message.includes("API response is not a valid array")) {
            throw error; // Re-throw validation error
        }
      // Throw a more generic message for other errors
      throw new Error(`An error occurred while fetching messages: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching messages.');
    }
  }
};

/**
 * Sends a message to a specific chat via the backend API.
 *
 * @param chatId The ID of the chat to send the message to.
 * @param content The text content of the message.
 * @returns A promise that resolves to the newly created Message object returned by the backend.
 * @throws An error if the API call fails or the token is missing.
 */
 export const sendMessage = async (_chatId: string, _content: string) => {
  throw new Error('sendMessage should be handled via WebSocket. Use useChatSocket().sendMessage instead.');
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
     return { id: messageId, senderId: 'currentUser', sender: {_id: 'currentUser', name: 'You'}, content: newContent, timestamp: new Date(), isEdited: true };
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
    return { _id: chatId, participants: [{_id: 'someUser', name:'Fetched User'}], lastMessage: undefined };
}

// Add functions for creating new chats, fetching user details, etc.

/**
 * Searches for users by calling the backend API.
 *
 * @param query The search string for usernames.
 * @returns A promise that resolves to an array of matching User objects.
 * @throws An error if the API call fails or the token is missing.
 */
 export const searchUsers = async (query: string): Promise<User[]> => {
  const trimmedQuery = query.trim();
  console.log(`API Call: searchUsers("${trimmedQuery}")`);

  // 1. Return early if the query is empty
  if (!trimmedQuery) {
    console.log("searchUsers: Query is empty, returning empty array.");
    return [];
  }

  // 2. Get the authentication token (handle SSR)
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  if (!token) {
    console.error("searchUsers: Auth token not found in localStorage.");
    // Throw an error as the backend requires authentication
    throw new Error("Authentication token not found. Please log in.");
  }

  try {
    // 3. Construct the URL with query parameters
    const params = new URLSearchParams({ key: trimmedQuery });
    const url = `/api/users?${params.toString()}`; // Assumes Next.js API route at /api/users

    console.log(`searchUsers: Fetching from URL: ${url}`);

    // 4. Make the authenticated GET request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Crucial: Include the JWT token for authentication
        Authorization: `Bearer ${token}`,
        // Although GET requests don't typically have a body,
        // Content-Type is often expected by backend frameworks.
        "Content-Type": "application/json",
      },
    });

    // 5. Handle the response
    if (response.ok) {
      const backendUsers: { _id: string; username: string }[] = await response.json();
      console.log("searchUsers: Successfully fetched users:", backendUsers);

      // 6. Map backend response to frontend User type
      const frontendUsers: User[] = backendUsers.map(user => ({
        _id: user._id,       // Map _id to id
        name: user.username, // Map username to name
        // avatarUrl: user.avatarUrl || undefined // Map avatar if available in backend response
      }));

      return frontendUsers;
    } else {
      // Handle HTTP errors (e.g., 401 Unauthorized, 404 Not Found, 500 Server Error)
      console.error("searchUsers: API request failed - Status:", response.status, response.statusText);
      // Provide a more specific error message if possible
      let errorMsg = `Failed to search users: ${response.status} ${response.statusText}`;
      if (response.status === 401) {
        errorMsg = "Authentication failed. Please log in again.";
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    // Handle network errors or errors during fetch/JSON parsing
    console.error("searchUsers: Network or other error occurred:", error);
    // Re-throw the error or a generic one
    if (error instanceof Error) {
      throw error; // Re-throw the original error
    } else {
      throw new Error('An unknown error occurred while searching for users.');
    }
  }
};

/**
 * Finds an existing chat with the other user or creates a new one via the backend API.
 *
 * @param otherUserId The ID of the other participant in the chat.
 * @returns A promise that resolves to the found or created Chat object.
 * @throws An error if the API call fails, the token is missing, or the backend returns an error.
 */
 export const findOrCreateChat = async (otherUserId: string): Promise<Chat> => {
  console.log(`API Call: findOrCreateChat(otherUserId: ${otherUserId})`);

  // 1. Validate input
  if (!otherUserId || typeof otherUserId !== 'string' || otherUserId.trim() === '') {
    console.error("findOrCreateChat: Invalid otherUserId provided.");
    throw new Error("Invalid user ID provided.");
  }

  // 2. Get the authentication token (handle SSR)
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  if (!token) {
    console.error("findOrCreateChat: Auth token not found in localStorage.");
    throw new Error("Authentication token not found. Please log in.");
  }

  try {
    // 3. Define the API endpoint
    // Assuming a Next.js API route at /api/chat/findOrCreate which proxies to your backend
    const url = '/api/chat/findOrCreate';

    console.log(`findOrCreateChat: Calling POST ${url}`);

    // 4. Make the authenticated POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        // Include the JWT token for authentication
        Authorization: `Bearer ${token}`,
        // Specify the content type of the request body
        "Content-Type": "application/json",
      },
      // Send the other user's ID in the request body
      body: JSON.stringify({ otherUserId: otherUserId.trim() }),
    });

    // 5. Handle the response
    const responseBody = await response.json(); // Always try to parse JSON, even for errors

    if (response.ok) {
      console.log("findOrCreateChat: Successfully found or created chat:", responseBody);
      // Add validation here if needed to ensure responseBody matches Chat type
      if (!responseBody || typeof responseBody._id !== 'string' || !Array.isArray(responseBody.participants)) {
          throw new Error("API response is not a valid Chat object.");
      }
      return responseBody as Chat; // Return the Chat object from the backend
    } else {
      // Handle HTTP errors (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error)
      const errorMsg = responseBody?.message || responseBody?.msg || `Failed to find or create chat: ${response.status} ${response.statusText}`;
      console.error(`findOrCreateChat: API request failed - Status: ${response.status}`, responseBody);
      throw new Error(errorMsg);
    }
  } catch (error) {
    // Handle network errors or errors during fetch/JSON parsing
    console.error("findOrCreateChat: Network or other error occurred:", error);
    // Re-throw the error or a generic one
    if (error instanceof Error) {
      // Avoid exposing potentially sensitive details from low-level errors
      if (error.message.includes("API response is not a valid Chat object")) {
           throw error; // Re-throw validation error
      }
      // Throw a more generic message for other errors
      throw new Error(`An error occurred while finding or creating the chat: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during findOrCreateChat.');
    }
  }
};