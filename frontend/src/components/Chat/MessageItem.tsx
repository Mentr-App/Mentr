// components/chat/MessageItem.tsx
import React, { useState } from 'react';
import { Message } from './types';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const alignmentClass = isOwnMessage ? 'justify-end' : 'justify-start';
  // Own messages: Blue background, primary text
  // Received messages: Secondary-light background, primary text
  const bubbleClass = isOwnMessage
    ? 'bg-blue-600 text-gray-50'
    : 'bg-[#343b45] text-gray-50';
  const messageContainerClass = `flex ${alignmentClass} group relative`;

  const handleEditClick = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
     if (editedContent.trim() && editedContent.trim() !== message.content) {
         onEdit(editedContent.trim());
     }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
     if (event.key === 'Enter' && !event.shiftKey) {
         event.preventDefault(); handleSaveEdit();
     } else if (event.key === 'Escape') {
         handleCancelEdit();
     }
  };

  return (
    <div className={messageContainerClass}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg shadow ${bubbleClass}`}>
        {!isOwnMessage && message.sender?.name && ( // Show sender name for received messages
           // Use secondary text color for sender name
           <p className="text-xs font-semibold mb-1 text-gray-300">{message.sender.name}</p>
        )}

        {isEditing ? (
            // --- Edit Mode ---
            <div className="flex flex-col">
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    // Use background color, primary text, secondary border
                    className="text-sm bg-[#1e252b] text-gray-50 rounded p-2 border border-[#343b45] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none mb-1"
                    rows={Math.max(1, Math.min(5, editedContent.split('\n').length))}
                    autoFocus
                />
                <div className="flex justify-end items-center space-x-2 mt-1 text-xs">
                     {/* Use light text for helper, orange for Save */}
                     <span className="text-gray-400 flex-grow">ESC cancel • Enter save</span>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-200 font-medium">Cancel</button>
                    <button onClick={handleSaveEdit} className="text-orange-400 hover:text-orange-300 font-bold">Save</button>
                </div>
            </div>
        ) : (
            // --- Display Mode ---
            <>
                {/* Primary text color set by bubbleClass */}
                <p className="text-sm break-words">{message.content}</p>
                <div className="flex justify-end items-center mt-1 space-x-1">
                    {message.isEdited && <span className="text-xs opacity-70">(edited)</span>}
                    {/* Timestamp text color depends on bubble background for contrast */}
                    <span className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'} opacity-80`}>
                        {format(new Date(message.timestamp), 'p')}
                    </span>
                </div>
            </>
        )}

        {/* Edit/Delete Options */}
        {isOwnMessage && !isEditing && (
            // Position slightly differently for better visibility on dark theme
             <div className="absolute top-0 -left-1 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                 {/* Use a dark background for the controls pop-out */}
                 <div className="bg-[#2c343c] rounded-full shadow-md p-1 flex space-x-1 border border-[#343b45]">
                    {/* Use light icons, blue/red hover */}
                    <button onClick={handleEditClick} title="Edit message" className="text-gray-400 hover:text-blue-400 p-1 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                     <button onClick={onDelete} title="Delete message" className="text-gray-400 hover:text-red-500 p-1 focus:outline-none">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                     </button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;