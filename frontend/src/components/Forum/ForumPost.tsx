import React, { useState } from "react";
import { Post } from "./Forum";
import { useAuth } from "@/contexts/AuthContext";

interface ForumPostProps {
    post: Post;
    currentVoteType: "up" | "down" | null;
    onVoteUpdate: (
        postId: string,
        voteType: "up" | "down" | null,
        newUpvotes: number,
        newDownvotes: number
    ) => void;
}

const ForumPost: React.FC<ForumPostProps> = ({
    post,
    currentVoteType,
    onVoteUpdate,
}) => {
    const { isAuthenticated } = useAuth();
    const [upvotes, setUpvotes] = useState<number>(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState<number>(post.downvotes || 0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleVote = async (type: "up" | "down") => {
        if (!isAuthenticated) {
            alert("You need to log in to vote on posts");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/post/${post._id.$oid}?action=vote`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "access_token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ vote_type: type }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUpvotes(data.upvotes);
                setDownvotes(data.downvotes);
                onVoteUpdate(
                    post._id.$oid,
                    data.vote_type,
                    data.upvotes,
                    data.downvotes
                );
            }
        } catch (error) {
            console.error("Error voting on post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        if (diffHours < 0) {
            return "Now";
        } else if (diffHours < 24) {
            const hours = Math.floor(diffHours);
            return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
        } else if (diffDays < 7) {
            const days = Math.floor(diffDays);
            return days === 1 ? "Yesterday" : `${days} days ago`;
        } else {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    return (
        <div className='bg-secondary-light rounded-lg shadow-lg p-6 hover:bg-gray-500 ease-in-out transition duration-300'>
            <h2 className='text-xl font-semibold text-text-primary mb-2'>
                {post.title}
            </h2>
            <p className='text-text-secondary mb-4'>{post.content}</p>
            <div className='flex justify-between items-center text-sm text-text-light'>
                <div className='flex items-center space-x-4'>
                    <span>{post.author || "Anonymous"}</span>
                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={() => handleVote("up")}
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                currentVoteType === "up"
                                    ? "text-green-500"
                                    : "text-gray-400 hover:text-green-500"
                            }`}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill={
                                    currentVoteType === "up"
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={
                                    currentVoteType === "up" ? "0" : "2"
                                }>
                                <path d='M4 14h16v2H4v-2zm8-10L4 12h16L12 4z' />
                            </svg>
                            <span>{upvotes}</span>
                        </button>
                        <button
                            onClick={() => handleVote("down")}
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
                                    currentVoteType === "down"
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={
                                    currentVoteType === "down" ? "0" : "2"
                                }>
                                <path d='M4 8h16v2H4V8zm8 10l8-8H4l8 8z' />
                            </svg>
                            <span>{downvotes}</span>
                        </button>
                    </div>
                </div>
                <span>{getRelativeTime(post.created_at)}</span>
            </div>
        </div>
    );
};

export default ForumPost;
