// app/chat/page.tsx
import MatchViewPage from "@/components/Match/MatchView";
import React from "react";

const MatchPage: React.FC = () => {
  return (
    // Apply the darkest background to the overall page container
    <div className="m-5 h-screen w-screen">
      <MatchViewPage/>
    </div>
  );
};

export default MatchPage;