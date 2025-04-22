// components/chat/MessageInput.tsx
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as unknown as React.FormEvent);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        // Use darkest background, primary text, secondary border, orange focus ring
        className="flex-grow p-2 bg-[#1e252b] text-gray-50 border border-[#343b45] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
        rows={1}
        style={{ maxHeight: '120px' }} // Adjust as needed
      />
      <button
        type="submit"
        disabled={!message.trim()}
        // Use primary orange button style, grayed out when disabled
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;