import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import CommentSection from "../CommentSection/CommentSection";
import CommentInput from "../CommentSection/CommentSection";

interface PostViewProps {
    post_id: string
}

interface Post {
    _id: IDObject;
    title: string;
    content: string;
    author?: AuthorObject | undefined;
    author_id: IDObject;
    created_at: string;
    downvotes: number;
    upvotes: number;
    views: number;
}

interface AuthorObject {
    _id: string;
    username: string
}

interface IDObject {
    $oid: string;
}

interface UserVotes {
    [postId: string]: "up" | "down";
}

const PostView: React.FC<PostViewProps> = ({post_id}) => {
    const [post, setPost] = useState<Post | null>(null)
    const { isAuthenticated, setIsPopupVisible } = useAuth();
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const [error, setError] = useState<string | null>(null);
    const [upvotes, setUpvotes] = useState<number>(0);
    const [downvotes, setDownvotes] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentVoteType, setCurrentVoteType] = useState<string | null>(null)

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        console.log(date, post)
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        console.log(diffHours)
        const diffDays = diffHours / 24;

        if (diffHours <= 0) {
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

    const fetchUserVotes = async () => {
        if (!isAuthenticated) {
            setUserVotes({});
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/user/votes", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserVotes(data.votes);
            }
        } catch (error) {
            console.error("Error fetching user votes:", error);
        }
    };

    const getPost = async() => {
        const endpoint = "/api/post/" + post_id
        try {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    errorData.message || "Something went wrong"
                )
            }

            const data = await response.json()
            console.log(data.post)
            setPost(data.post)
            
        } catch (error) {
            const errorMessage = 
                error instanceof Error
                    ? error.message
                    : "An unknown error has occurred"
                
        }
    }

    const handleVote = async (type: "up" | "down") => {
        if (!isAuthenticated) {
            setIsPopupVisible(true)
            return;
        }

        if (!post) {
            return
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/vote/${post._id.$oid}?action=vote`,
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
                handleVoteUpdate(
                    (post as Post)._id.$oid,
                    data.vote_type, 
                );
            }
        } catch (error) {
            console.error("Error voting on post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoteUpdate = (
        postId: string,
        newVoteType: "up" | "down" | null,
    ) => {
        setUserVotes((prev) => {
            const newVotes = { ...prev };
            if (newVoteType === null) {
                delete newVotes[postId];
            } else {
                newVotes[postId] = newVoteType;
            }
            return newVotes;
        });
    };

    useEffect(() => {
        getPost()
        fetchUserVotes()
    }, [])

    useEffect(() => {
        if (post) {
            setUpvotes(post.upvotes)
            setDownvotes(post.downvotes)
        }
    }, [post])

    useEffect(() => {
        if (post && userVotes) {
            setCurrentVoteType(userVotes[post._id.$oid])
        }
    }, [userVotes, post])

    if (!post) return <></>

    return (
        <div className="h-[80vh] w-screen m-5 p-6 bg-secondary-light shadow-md rounded-lg overflow-y-scroll overflow-x-hidden flex flex-col">
            <div className="m-5 break-words max-w-full">
                <h2 className="text-white text-2xl font-bold mt-4">
                    {post.title}
                </h2>
                <h3 className="text-white font-semibold">{post.author?.username ?? "Unknown author"}</h3>
                <p className="text-white mt-2">{post.content}</p>
            </div>
            <div className='mx-3 flex justify-between items-center text-sm text-text-light'>
                <div className='flex items-center space-x-4'>
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
                <div className="flex flex-col">
                    <span>{post.views} views</span>
                    <span>{getRelativeTime(post.created_at)}</span>
                </div>
            </div>
            <CommentInput onCommentSubmit={() => console.log()}/>
        </div>
    )
}

export default PostView