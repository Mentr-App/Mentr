import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import VerifiedIcon from "@/components/Icons/VerifiedIcon";
import UnverifiedIcon from "@/components/Icons/UnverifiedIcon";

export interface Mentor {
  _id: { $oid: string };
  username: string;
  company: string;
  industry: string;
  userType?: "Mentor" | "Mentee";
  verified?: boolean;
}

interface MentorCardProps {
  mentor: Mentor;
  onClick: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  const router = useRouter();
  const { userType } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`/api/profile/getPublicProfile?userID=${mentor._id.$oid}`);
        const data = await response.json();
        setProfilePictureUrl(data.profile_picture || null);
      } catch (error) {
        console.error("Error fetching public profile:", error);
      }
    };

    fetchProfilePicture();
  }, [mentor._id.$oid]);

  const handleProfileClick = () => {
    router.push(`/profile/${mentor._id.$oid}`);
  };

  const handleRequest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const senderId = localStorage.getItem("userId");
    const senderRole = userType;

    if (!senderId || !senderRole) {
      console.error("User not logged in or role missing");
      return;
    }

    try {
      const res = await fetch("/api/match/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          receiverId: mentor._id.$oid,
          senderRole,
        }),
      });

      const data = await res.json();

      if (data.alreadyExists) {
        setAlreadyRequested(true);
        setRequestSent(true);
      } else if (res.ok) {
        setRequestSent(true);

        try {
          await fetch(`/api/profile/getAnalytics?userId=${senderId}`);
          await fetch(`/api/profile/getAnalytics?userId=${mentor._id.$oid}`);
        } catch (err) {
          console.error("Error refreshing analytics after request:", err);
        }
      }
    } catch (err) {
      console.error("Error sending mentorship request:", err);
    }
  };

  return (
    <div
      onClick={handleProfileClick}
      className="bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 transition duration-300 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <img
          src={profilePictureUrl || "https://placehold.co/100x100/cccccc/ffffff?text=User"}
          alt="Profile"
          className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/100x100/cccccc/ffffff?text=User";
          }}
        />
        <div>
          <div className="flex items-center space-x-1">
            <h3 className="text-lg font-semibold text-white">{mentor.username}</h3>
            {mentor.verified ? (
                <div className="w-5 h-5 text-green-500" title="Verified">
                    <VerifiedIcon />
                </div>
                ) : (
                <div className="w-5 h-5 text-red-500" title="Unverified">
                    <UnverifiedIcon />
                </div>
                )}
          </div>
          <p className="text-sm text-gray-400">
            {mentor.company} • {mentor.industry}
          </p>
          <p className="text-sm text-indigo-300 mt-1 capitalize">Role: {mentor.userType}</p>
          {requestSent ? (
            <p className="block font-bold text-[#EC6333] bg-[#2C353D] rounded mt-2 py-1 px-3">
              {alreadyRequested ? "Already requested!" : "Match requested!"}
            </p>
          ) : (
            <button
              className="block font-bold text-[#EC6333] bg-[#2C353D] rounded mt-2 py-1 px-3"
              onClick={handleRequest}
            >
              Request Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
