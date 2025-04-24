// components/chat/ChatItem.tsx
import React from 'react';
import { Chat, User } from './types';
import { formatDistanceToNow } from 'date-fns';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const getOtherParticipantName = (participants: User[]): string => {
    const currentUserId = localStorage.getItem("userId");
    const otherParticipant = participants.find(p => p._id !== currentUserId);
    return otherParticipant?.name || 'Unknown User';
};

const getOtherParticipantPic = (participants: User[]): string | undefined=> {
  const currentUserId = localStorage.getItem("userId");
  const otherParticipant = participants.find(p => p._id !== currentUserId);
  return otherParticipant?.avatarUrl || undefined;
};

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onSelect, onDelete }) => {
  const displayName = getOtherParticipantName(chat.participants);
  const lastMessage = chat.lastMessage;

  const baseClasses = "flex items-center p-3 hover:bg-[#343b45] cursor-pointer transition duration-150 ease-in-out border-b border-[#262d34] relative group"; // Ensure 'group' is here
  const selectedClasses = isSelected ? "bg-[#343b45]" : "";

  return (
    // The 'group' class enables group-hover for children like the delete button
    <li className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      {/* Avatar Placeholder */}
      <div className="flex-shrink-0 mr-3">
        <ProfilePicture userId="anonymous" profilePicture={getOtherParticipantPic(chat.participants)}/>
      </div>

      {/* Chat Info */}
      <div className="flex-grow overflow-hidden">
        {/* Top row: Name and the Time/Delete group */}
        <div className="flex justify-between items-start"> {/* Use items-start to align tops initially */}
            <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-orange-400' : 'text-gray-50'} mr-2`}>{displayName}</h3>

            {/* ****** MODIFIED SECTION ****** */}
            {/* This container holds timestamp and delete button */}
            {/* Use inline-flex, center items vertically, add spacing */}
            {/* flex-shrink-0 prevents it from shrinking */}
            <div className="inline-flex items-center space-x-1 flex-shrink-0">
                 {lastMessage && (
                     // Timestamp - Vertically centered by parent 'items-center'
                     <span className="text-xs text-gray-400 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                     </span>
                 )}
                 {/* Delete Button - Vertically centered. Opacity controlled by parent 'group-hover' */}
                 <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering onSelect
                        onDelete();
                    }}
                    // Keep group-hover logic
                    className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                    aria-label={`Delete chat with ${displayName}`}
                    title={`Delete chat with ${displayName}`}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
            </div>
             {/* ****** END MODIFIED SECTION ****** */}

        </div>

        {/* Bottom row: Last message preview */}
        {lastMessage ? (
           <p className="text-sm text-gray-300 truncate mt-1"> {/* Added mt-1 for spacing */}
               {lastMessage.content}
           </p>
        ) : (
            <p className="text-sm text-gray-400 italic mt-1">No messages yet</p>
        )}
      </div>
    </li>
  );
};

export default ChatItem;