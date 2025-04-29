// PendingInvitationsTab.tsx
import React, { useEffect, useState } from "react";
import PendingInvitationCard from "./PendingInvitationCard";

interface Mentorship {
  _id: { $oid: string };
  mentor: { $oid: string };
  mentee: { $oid: string };
  receiver: { $oid: string };
  pending: boolean;
  requestedAt: string;
}

const PendingInvitationsTab: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<Mentorship[]>([]);

  useEffect(() => {
    const fetchInvitations = async () => {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/match/pending?userId=" + userId);
      const data = await res.json();
      setPendingRequests(data);
    };
    fetchInvitations();
  }, []);

  return (
    <div className="flex-1 p-6 h-[88vh] overflow-scroll rounded" style={{ backgroundColor: "var(--background)" }}>
      <h1 className="text-3xl font-bold text-white mb-6">Pending Invitations</h1>

      {pendingRequests.length === 0 ? (
        <p className="text-gray-400 text-sm">No pending invitations.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.map((invitation) => (
            <PendingInvitationCard
              key={invitation._id.$oid}
              invitation={invitation}
              onUpdate={() => {
                setPendingRequests((prev) =>
                  prev.filter((i) => i._id.$oid !== invitation._id.$oid)
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingInvitationsTab;
