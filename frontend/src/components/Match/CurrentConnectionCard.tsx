import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VerifiedIcon from "@/components/Icons/VerifiedIcon";
import UnverifiedIcon from "@/components/Icons/UnverifiedIcon";

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
    const [verified, setVerified] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [ended, setEnded] = useState(false);
    const currentUserId = localStorage.getItem("userId");

    const isMentor = currentUserId === connection.mentor.$oid;
    const otherUserId =
        connection.mentor.$oid === currentUserId
            ? connection.mentee.$oid
            : connection.mentor.$oid;

    useEffect(() => {
        fetch(`/api/profile/getPublicProfile?userID=${otherUserId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.username) setOtherUsername(data.username);
                setVerified(data.verified || false);
            });
    }, [otherUserId]);

    const getTimeAgo = (timestamp: any) => {
        const isoTime =
            typeof timestamp === "object" && "$date" in timestamp
                ? timestamp.$date
                : timestamp;
        const date = new Date(isoTime);
        if (isNaN(date.getTime())) return "invalid time";

        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    };

    const confirmRemoval = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            await fetch("/api/match/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: connection._id.$oid,
                    action: "reject",
                }),
            });

            try {
                await fetch(`/api/profile/getAnalytics?userId=${currentUserId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });

                await fetch(`/api/profile/getAnalytics?userId=${otherUserId}`, {
                    method: "GET",
                });
            } catch (err) {
                console.error("Error refreshing analytics:", err);
            }

            setEnded(true);
        } catch (error) {
            console.error("Failed to end mentorship:", error);
        }
    };

    return (
        <div
            onClick={() => router.push(`/profile/${otherUserId}`)}
            className='bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 transition duration-300 cursor-pointer'>
            <div className="flex items-center gap-2">
                <p className='text-white'>
                    Connected with <span className='font-semibold'>{otherUsername}</span>
                </p>
                {verified ? (
                    <div title="Verified" className="w-4 h-4 text-green-500">
                        <VerifiedIcon />
                    </div>
                ) : (
                    <div title="Unverified" className="w-4 h-4 text-red-500">
                        <UnverifiedIcon />
                    </div>
                )}
            </div>
            <p className='text-gray-400 text-sm mt-1'>
                {getTimeAgo(connection.created_at)}
            </p>

            {ended ? (
                <p className='mt-3 text-[#EC6333] font-semibold'>
                    Mentorship ended successfully.
                </p>
            ) : isMentor || !isMentor ? (
                <div className='mt-3'>
                    {confirming ? (
                        <div className='space-x-2'>
                            <button
                                onClick={confirmRemoval}
                                className='bg-red-600 text-white px-3 py-1 rounded'>
                                Confirm End
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirming(false);
                                }}
                                className='bg-gray-500 text-white px-3 py-1 rounded'>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirming(true);
                            }}
                            className='text-white bg-[#EC6333] px-3 py-1 rounded'>
                            End Mentorship
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default CurrentConnectionCard;
