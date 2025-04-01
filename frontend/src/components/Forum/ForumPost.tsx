import React, { useState } from "react";
import { Post } from "./Forum";
import { useAuth } from "@/contexts/AuthContext";
import { getRelativeTime } from "@/lib/timeUtils";

interface ForumPostProps {
    post: Post;
    currentVoteType: "up" | "down" | null;
    onVoteUpdate: (
        postId: string,
        voteType: "up" | "down" | null,
        newUpvotes: number,
        newDownvotes: number
    ) => void;
    onClick: () => void;
}

const ForumPost: React.FC<ForumPostProps> = ({
    post,
    currentVoteType,
    onVoteUpdate,
    onClick,
}) => {
    const { isAuthenticated, setIsPopupVisible } = useAuth();
    const [upvotes, setUpvotes] = useState<number>(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState<number>(post.downvotes || 0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const commentsCount = post.comments || 0;

    const handleButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        voteType: "up" | "down"
    ) => {
        event.stopPropagation();

        handleVote(voteType);
    };

    const handleVote = async (type: "up" | "down") => {
        if (!isAuthenticated) {
            setIsPopupVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/vote/${post._id.$oid}?action=vote`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ vote_type: type }),
            });

            if (response.ok) {
                const data = await response.json();
                setUpvotes(data.upvotes);
                setDownvotes(data.downvotes);
                onVoteUpdate(post._id.$oid, data.vote_type, data.upvotes, data.downvotes);
            }
        } catch (error) {
            console.error("Error voting on post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            onClick={onClick}
            className='bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 ease-in-out transition duration-300 cursor-pointer'>
            <h2 className='text-xl font-semibold text-text-primary mb-2'>{post.title}</h2>
            <p className='text-text-secondary mb-4'>{post.content}</p>
            <div className='flex justify-between items-center text-sm text-text-light'>
                <div className='flex items-center space-x-4'>
                    <span>{post.author || "Anonymous"}</span>
                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={(event) => handleButtonClick(event, "up")}
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                currentVoteType === "up"
                                    ? "text-green-500"
                                    : "text-gray-400 hover:text-green-500"
                            }`}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill={currentVoteType === "up" ? "currentColor" : "none"}
                                stroke='currentColor'
                                className='w-4 h-4'
                                strokeWidth={currentVoteType === "up" ? "0" : "2"}>
                                <path d='M4 14h16v2H4v-2zm8-10L4 12h16L12 4z' />
                            </svg>
                            <span>{upvotes}</span>
                        </button>
                        <button
                            onClick={(event) => handleButtonClick(event, "down")}
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                currentVoteType === "down"
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                            }`}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill={
                                    currentVoteType === "down" ? "currentColor" : "none"
                                }
                                stroke='currentColor'
                                className='w-4 h-4'
                                strokeWidth={currentVoteType === "down" ? "0" : "2"}>
                                <path d='M4 8h16v2H4V8zm8 10l8-8H4l8 8z' />
                            </svg>
                            <span>{downvotes}</span>
                        </button>
                        
                        {/* Comment Count Icon */}
                        <div className='flex items-center space-x-1 px-2 py-1 text-gray-400'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                className='w-4 h-4'>
                                <path 
                                    strokeLinecap='round' 
                                    strokeLinejoin='round' 
                                    strokeWidth='2'
                                    d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' 
                                />
                            </svg>
                            <span>{commentsCount}</span>
                        </div>
                    </div>
                </div>
                <span className="text-xs">{getRelativeTime(post.created_at)}</span>
            </div>
        </div>
    );
};

export default ForumPost;
