// app/chat/page.tsx
import React from "react";
import ChatComponent from "@/components/Chat/Chat"; // Assuming components are in @/components

const ChatPage: React.FC = () => {
  return (
    // Apply the darkest background to the overall page container
    <div className="m-5 h-screen w-screen flex bg-[#1e252b]">
      <ChatComponent />
    </div>
  );
};

export default ChatPage;