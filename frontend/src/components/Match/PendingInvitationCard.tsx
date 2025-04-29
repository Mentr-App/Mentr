import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PendingInvitationCardProps {
  invitation: {
    _id: { $oid: string };
    mentor: { $oid: string };
    mentee: { $oid: string };
    receiver: { $oid: string };
    requestedAt: string;
  };
  onUpdate: () => void;
}

const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({
  invitation,
  onUpdate,
}) => {
  const router = useRouter();
  const [otherUsername, setOtherUsername] = useState("Unknown");
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const currentUserId = localStorage.getItem("userId");

  if (
    !invitation?.receiver?.$oid ||
    !invitation?.mentor?.$oid ||
    !invitation?.mentee?.$oid ||
    !invitation?._id?.$oid ||
    !invitation?.requestedAt
  ) {
    return null;
  }

  const isReceiver = currentUserId === invitation.receiver.$oid;

  const otherUserId =
    invitation.mentor.$oid === currentUserId
      ? invitation.mentee.$oid
      : invitation.mentor.$oid;

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await fetch(`/api/profile/getPublicProfile?userID=${otherUserId}`);
        const data = await res.json();
        if (data?.username) {
          setOtherUsername(data.username);
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
      }
    };

    fetchUsername();
  }, [otherUserId]);

  const getTimeAgo = (timestamp: any) => {
    const isoTime =
      typeof timestamp === "object" && timestamp !== null && "$date" in timestamp
        ? timestamp.$date
        : timestamp;

    const date = new Date(isoTime);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date passed to getTimeAgo:", timestamp);
      return "invalid time";
    }

    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  const respond = async (action: "accept" | "reject") => {
    try {
      await fetch("/api/match/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation._id.$oid, action }),
      });
      setConfirmationMessage(action === "accept" ? "Mentorship accepted!" : "Mentorship rejected!");
      setTimeout(() => {
        onUpdate();
      }, 1000); // Wait 1 second before removing
    } catch (err) {
      console.error("Error sending mentorship response:", err);
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${otherUserId}`)}
      className="bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 transition duration-300 cursor-pointer"
    >
      <p className="text-white">
        {isReceiver ? (
          <>
            <span className="font-semibold">{otherUsername}</span> invited you to a mentorship
          </>
        ) : (
          <>
            You invited <span className="font-semibold">{otherUsername}</span> to a mentorship
          </>
        )}
      </p>
      <p className="text-gray-400 text-sm mt-1">{getTimeAgo(invitation.requestedAt)}</p>

      {confirmationMessage ? (
        <p className="text-[#EC6333] font-semibold mt-3">{confirmationMessage}</p>
      ) : (
        <div className="mt-3 space-x-2">
          {isReceiver ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  respond("accept");
                }}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  respond("reject");
                }}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                respond("reject");
              }}
              className="text-white bg-[#EC6333] px-3 py-1 rounded"
            >
              Cancel Invitation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingInvitationCard;
