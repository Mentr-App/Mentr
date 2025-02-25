import React, { useState, useEffect } from "react";
import { Post } from "./Forum";

interface ForumPostProps {
    post: Post;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
    const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
    const [upvotes, setUpvotes] = useState<number>(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState<number>(post.downvotes || 0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const checkVoteStatus = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setVoteType(null);
                return;
            }

            try {
                const response = await fetch(
                    `/api/post/${post._id.$oid}?action=vote`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setVoteType(data.vote_type);
                } else if (response.status === 401) {
                    // Clear vote state if unauthorized
                    setVoteType(null);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                }
            } catch (error) {
                console.error("Error checking vote status:", error);
                setVoteType(null);
            }
        };

        checkVoteStatus();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "access_token") {
                if (!e.newValue) {
                    setVoteType(null);
                } else {
                    checkVoteStatus();
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [post._id]);

    // Update vote counts whenever post data changes
    useEffect(() => {
        setUpvotes(post.upvotes || 0);
        setDownvotes(post.downvotes || 0);
    }, [post.upvotes, post.downvotes]);

    const handleVote = async (type: "up" | "down") => {
        const token = localStorage.getItem("access_token");
        if (!token) {
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
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ vote_type: type }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setVoteType(data.vote_type);
                setUpvotes(data.upvotes);
                setDownvotes(data.downvotes);
            } else {
                const errorData = await response.json().catch(() => null);
                console.error(
                    "Error voting on post:",
                    response.status,
                    errorData
                );

                if (response.status === 401) {
                    setVoteType(null);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    alert("Your session has expired. Please log in again.");
                }
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
                                voteType === "up"
                                    ? "text-green-500"
                                    : "text-gray-400 hover:text-green-500"
                            }`}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill={
                                    voteType === "up" ? "currentColor" : "none"
                                }
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={voteType === "up" ? "0" : "2"}>
                                <path d='M4 14h16v2H4v-2zm8-10L4 12h16L12 4z' />
                            </svg>
                            <span>{upvotes}</span>
                        </button>
                        <button
                            onClick={() => handleVote("down")}
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                voteType === "down"
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                            }`}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill={
                                    voteType === "down"
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={voteType === "down" ? "0" : "2"}>
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
