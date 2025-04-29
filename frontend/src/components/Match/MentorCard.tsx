import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface Mentor {
  _id: { $oid: string };
  username: string;
  company: string;
  industry: string;
}

interface MentorCardProps {
  mentor: Mentor;
  onClick: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  const router = useRouter();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [role, setRole] = useState<"mentor" | "mentee" | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await fetch(`/api/profile/getPublicProfile?userID=${mentor._id.$oid}`);
        if (!response.ok) {
          console.error("Failed to fetch public profile");
          return;
        }
        const data = await response.json();
        setProfilePictureUrl(data.profile_picture || null);

        const userType = data.userType?.toLowerCase(); // Normalize case
        if (userType === "mentor" || userType === "mentee") {
          setRole(userType);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      }
    };

    fetchPublicProfile();
  }, [mentor._id.$oid]);

  const handleProfileClick = () => {
    router.push(`/profile/${mentor._id.$oid}`);
  };

  const handleRequestClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    alert(`Request ${role === "mentor" ? "mentorship" : "menteeship"} sent to ${mentor.username}`);
    // Call API here if needed
  };

  return (
    <div
      onClick={handleProfileClick}
      className="bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 transition duration-300 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <img
          src={profilePictureUrl || "https://placehold.co/100x100/cccccc/ffffff?text=User"}
          alt="Profile Picture"
          className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/100x100/cccccc/ffffff?text=User";
          }}
        />
        <div>
          <h3 className="text-lg font-semibold text-white">{mentor.username}</h3>
          <p className="text-sm text-gray-400">{mentor.company} • {mentor.industry}</p>
          {role && (
            <>
              <p className="text-sm text-indigo-300 mt-1 capitalize">Role: {role}</p>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                onClick={handleRequestClick}
              >
                Request {role === "mentor" ? "Mentorship" : "Menteeship"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
