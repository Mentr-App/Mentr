import React, { useEffect, useState } from "react";
import ForumPost from "./ForumPost";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export interface Post {
    _id: IDObject;
    title: string;
    content: string;
    author?: string;
    author_id: IDObject;
    created_at: string;
    downvotes: number;
    upvotes: number;
    views: number;
}

export interface AuthorObject {
    _id: string;
    username: string
}

export interface IDObject {
    $oid: string;
}

interface UserVotes {
    [postId: string]: "up" | "down";
}

const Forum: React.FC = () => {
    const [feed, setFeed] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const { isAuthenticated } = useAuth();

    // Track which layout is active (grid or list)
    const [isGridView, setIsGridView] = useState(true);

    const router = useRouter()

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

    const handlePostClick = (post: Post) => {
        console.log(post)
        router.push("/post/" + post._id.$oid)
    }

    useEffect(() => {
        fetchUserVotes();
    }, [isAuthenticated]);

    useEffect(() => {
        const endpoint = "/api/feed";
        const access_token = localStorage.getItem("access_token");
        const loadFeed = async () => {
            try {
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Something went wrong"
                    );
                }

                const data = await response.json();
                console.log(data);
                setFeed(data.feed);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadFeed();
    }, []);

    const handleVoteUpdate = (
        postId: string,
        newVoteType: "up" | "down" | null,
        newUpvotes: number,
        newDownvotes: number
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
        setFeed((prev) =>
            prev.map((post) =>
                post._id.$oid === postId
                    ? { ...post, upvotes: newUpvotes, downvotes: newDownvotes }
                    : post
            )
        );
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-64'>
                <div
                    className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2'
                    style={{ borderColor: "var(--primary)" }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className='text-center p-4'
                style={{ color: "var(--primary-dark)" }}>
                {error}
            </div>
        );
    }

    if (feed.length === 0) {
        return (
            <div
                className='text-center p-4'
                style={{ color: "var(--text-secondary)" }}>
                No posts yet
            </div>
        );
    }

    return (
        <div
            className='flex-1 p-6 h-[88vh] overflow-scroll'
            style={{ backgroundColor: "var(--background)" }}>
            {/* Segmented Toggle */}
            <div className='flex justify-end mb-4'>
                <div className='toggle-container'>
                    {/* Grid Button */}
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`toggle-button ${
                            isGridView
                                ? "toggle-button-active"
                                : "toggle-button-inactive"
                        }`}>
                        <svg
                            className='toggle-icon'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path d='M3 3h4v4H3V3zm0 10h4v4H3v-4zm10-10h4v4h-4V3zm0 10h4v4h-4v-4z' />
                        </svg>
                        <span className='toggle-text'>Grid</span>
                    </button>

                    {/* List Button */}
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`toggle-button ${
                            !isGridView
                                ? "toggle-button-active"
                                : "toggle-button-inactive"
                        }`}>
                        <svg
                            className='toggle-icon'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path
                                fillRule='evenodd'
                                d='M4 5h12v2H4V5zm0 4h12v2H4V9zm0 4h12v2H4v-2z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span className='toggle-text'>List</span>
                    </button>
                </div>
            </div>

            <div className='flex-1 overflow-y-scroll px-6 pb-6'>
                {isGridView ? (
                    // Grid View
                    <div className='max-w-7xl mx-auto'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {feed.map((post) => (
                                <ForumPost
                                    key={post._id.$oid}
                                    post={post}
                                    currentVoteType={userVotes[post._id.$oid]}
                                    onVoteUpdate={handleVoteUpdate}
                                    onClick={() => handlePostClick(post)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // List View
                    <div className='max-w-3xl mx-auto space-y-6 overflow-scroll'>
                        {feed.map((post) => (
                            <ForumPost
                                key={post._id.$oid}
                                post={post}
                                currentVoteType={userVotes[post._id.$oid]}
                                onVoteUpdate={handleVoteUpdate}
                                onClick={() => handlePostClick(post)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forum;
