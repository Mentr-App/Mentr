import React, { useEffect, useState } from "react";
import CurrentConnectionCard from "./CurrentConnectionCard";

interface Mentorship {
  _id: { $oid: string };
  mentor: { $oid: string };
  mentee: { $oid: string };
  receiver: { $oid: string };
  pending: boolean;
  created_at: string;
}

const CurrentConnectionsTab: React.FC = () => {
  const [connections, setConnections] = useState<Mentorship[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/match/current?userId=" + userId);
      const data = await res.json();
      setConnections(data);
    };
    fetchConnections();
  }, []);

  return (
    <div className="flex-1 p-6 h-[88vh] overflow-scroll" style={{ backgroundColor: "var(--background)" }}>
      <h1 className="text-3xl font-bold text-white mb-6">Current Connections</h1>

      {connections.length === 0 ? (
        <p className="text-gray-400 text-sm">No current connections.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <CurrentConnectionCard key={conn._id.$oid} connection={conn} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentConnectionsTab;
