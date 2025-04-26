// components/chat/NewChatModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { User } from './types';
import { searchUsers } from './ChatApi';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
// Removed lodash import

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  currentUserId?: string;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onUserSelect,
  currentUserId = "currentUser"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold the timeout ID

  // --- Debounced Search Implementation using setTimeout ---
  useEffect(() => {
    // Clear the previous timeout whenever the query changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If the query is empty, reset state and don't start a new timeout
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
      return; // Exit the effect early
    }

    // Set loading state immediately or wait? Let's wait until timeout fires.
    // setError(null); // Clear previous errors when starting a new search cycle

    // Start a new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true); // Indicate searching state
      setError(null); // Clear error before new search
      try {
        console.log(`Executing search for: "${searchQuery}"`); // Log the query being executed
        const users = await searchUsers(searchQuery);
        const userId = localStorage.getItem("userId")
        console.log(users, userId)
        setSearchResults(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error("Failed to search users:", err);
        setError("Failed to search users. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false); // Clear searching state regardless of success/failure
      }
    }, 500); // 500ms debounce delay

    // --- Effect Cleanup ---
    // This function runs when the component unmounts or BEFORE the effect runs again
    // due to a change in dependencies (searchQuery, currentUserId).
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current); // Clear the timeout if effect re-runs or component unmounts
      }
    };
  }, [searchQuery, currentUserId]); // Dependencies for the effect

  const handleUserClick = (user: User) => {
    onUserSelect(user);
    // Reset state after selection (optional, can be handled by parent closing modal)
    // setSearchQuery('');
    // setSearchResults([]);
  };

  // Also reset state if the modal is closed externally by the parent
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
      setIsSearching(false);
      // Clear any potentially running timeout when modal is closed
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  return (
    // Modal JSX (no changes needed here from the previous version)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#2c343c] p-6 rounded-lg shadow-xl w-full max-w-md border border-[#343b45]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-50">Start New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full p-2 mb-4 bg-[#1e252b] text-gray-50 border border-[#343b45] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
          autoFocus
        />

        <div className="max-h-60 overflow-y-auto">
          {isSearching && <div className="text-center text-gray-400 py-2">Searching...</div>}
          {error && <div className="text-center text-red-400 py-2">{error}</div>}
          {!isSearching && searchResults.length === 0 && searchQuery.length > 0 && (
            <div className="text-center text-gray-400 py-2">No users found matching '{searchQuery}'.</div>
          )}
          {/* Hint text when input is empty */}
           {!isSearching && searchQuery.length === 0 && !error && (
               <div className="text-center text-gray-500 py-2">Enter a username above to search.</div>
           )}
          <ul>
            {searchResults.map((user) => (
              <li
                key={user._id}
                onClick={() => handleUserClick(user)}
                className="flex items-center p-3 hover:bg-[#343b45] cursor-pointer rounded-md transition duration-150 ease-in-out"
              >
                <div className="flex-shrink-0 mr-3">
                  <ProfilePicture profilePicture={user.profile_picture} userId={undefined}/>
                </div>
                <span className="text-gray-50">{user.name}</span>
              </li>
            ))}
          </ul>
        </div>

         <div className="mt-4 flex justify-end">
             <button
                 onClick={onClose}
                 className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-gray-50 transition duration-150 ease-in-out"
             >
                 Cancel
             </button>
         </div>
      </div>
    </div>
  );
};

export default NewChatModal;