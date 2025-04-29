import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CurrentConnectionCardProps {
  connection: {
    _id: { $oid: string };
    mentor: { $oid: string };
    mentee: { $oid: string };
    created_at: string;
  };
}

const CurrentConnectionCard: React.FC<CurrentConnectionCardProps> = ({ connection }) => {
  const router = useRouter();
  const [otherUsername, setOtherUsername] = useState("Unknown");
  const currentUserId = localStorage.getItem("userId");

  const otherUserId =
    connection.mentor.$oid === currentUserId
      ? connection.mentee.$oid
      : connection.mentor.$oid;

  useEffect(() => {
    fetch(`/api/profile/getPublicProfile?userID=${otherUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setOtherUsername(data.username);
      });
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

  const cancelMentorship = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent profile click
    try {
      await fetch("/api/match/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: connection._id.$oid,
          action: "reject", // Use the same reject path to delete it
        }),
      });
      router.refresh(); // Or optionally trigger reload depending on your app
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${otherUserId}`)}
      className="bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 transition duration-300 cursor-pointer"
    >
      <p className="text-white">
        Connected with <span className="font-semibold">{otherUsername}</span>
      </p>
      <p className="text-gray-400 text-sm mt-1">{getTimeAgo(connection.created_at)}</p>

      <div className="mt-3">
        <button
          onClick={cancelMentorship}
          className="bg-yellow-600 text-white px-3 py-1 rounded"
        >
          Cancel Mentorship
        </button>
      </div>
    </div>
  );
};

export default CurrentConnectionCard;
