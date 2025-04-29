import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CommentSection from "../CommentSection/CommentSection";
import { getRelativeTime } from "@/lib/timeUtils";
import DeleteButton from "../DeleteConfirmation/DeleteConfirmationProp";
import TextEditor from "../TextEditor/TextEditor";
import { Post, Author } from "../CommonInterfaces/Interfaces";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useRouter } from 'next/navigation';

interface PostViewProps {
    post_id: string;
}

interface UserVotes {
    [postId: string]: "up" | "down";
}

const PostView: React.FC<PostViewProps> = ({ post_id }) => {
    const [post, setPost] = useState<Post | null>(null);
    const { isAuthenticated, setIsPopupVisible } = useAuth();
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const [upvotes, setUpvotes] = useState<number>(0);
    const [downvotes, setDownvotes] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentVoteType, setCurrentVoteType] = useState<string | null>(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>("");
    const [authorProfile, setAuthorProfile] = useState<Author | null>(null);
    const [blocklist, setBlocklist] = useState<{blocked: string[], blocking: string[]}>({blocked: [], blocking: []});
    const [isUnblocking, setIsUnblocking] = useState(false);
    const [pinned, setPinned] = useState(false)
    const userId = localStorage.getItem("userId");
    const router = useRouter();

    const handleSavePost = async () => {
        if (!isAuthenticated || !userId || !post?._id?.$oid) {
            setIsPopupVisible(true);
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8000/saved_post/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, postId: post._id.$oid }),
            });
    
            if (response.ok) {
            } else {
                throw new Error("Save failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBlocklist = async () => {
        if (!isAuthenticated) return;
        
        try {
            const response = await fetch("/api/profile/getBlockList", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBlocklist({
                    blocked: data.blocked || [],
                    blocking: data.blocking || []
                });
            }
        } catch (error) {
            console.error("Error fetching blocklist:", error);
        }
    };

    const fetchUserPinned = async () => {
        if (!isAuthenticated || !userId) {
            return
        }

        try {
            const endpoint = "/api/profile/getPinned"
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const data = await response.json()
                const pinned_posts = data.pinned_posts
                console.log(pinned_posts, post?._id.$oid, pinned_posts.includes(post?._id.$oid))
                if ((post) && (pinned_posts.includes(post?._id.$oid))) {
                    console.log(true)
                    setPinned(true)
                }
                console.log(data)
            }
        } catch (error) {
            console.error("error getting pinned:", error)
        }
    }

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

    const getPost = async () => {
        const endpoint = "/api/post/" + post_id;
        try {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            const data = await response.json();
            setPost(data.post);
            setEditText(data.post.content);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    };

    const handleVote = async (type: "up" | "down") => {
        if (!isAuthenticated) {
            setIsPopupVisible(true);
            return;
        }

        if (!post) return;

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
                setUserVotes(prev => ({
                    ...prev,
                    [post._id.$oid]: data.vote_type
                }));
            }
        } catch (error) {
            console.error("Error voting on post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePin = async () => {
        if (!isAuthenticated || !post || !userId) {
            return
        }

        try {
            const endpoint = `/api/post/pin/${post._id.$oid}`
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                },
            })

            if (response.ok) {
                const data = await response.json()
                setPinned(true)
                console.log(data)
            }
        } catch (error) {
            console.error("Error pinning post:", error)
        }
    }

    const handleUnpin = async () => {
        if (!isAuthenticated || !userId || !post) {
            return
        }

        try {
            const endpoint = `/api/post/unpin/${post._id.$oid}`
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                },
            })

            if (response.ok) {
                const data = await response.json()
                console.log(data)
                setPinned(false)
            }
        } catch (error) {
            console.error("Error pinning post:", error)
        }
    }

    const handleEditSubmit = async () => {
        if (!isAuthenticated || !post || editText === post.content || editText === "") {
            return;
        }

        try {
            const endpoint = `/api/post/edit/${post._id.$oid}`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: editText }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsEditing(false);
                setPost(data.post);
            }
        } catch (error) {
            console.error("Error editing post:", error);
        }
    }

    const handleDelete = async() => {
        if (!isAuthenticated || !post) return;

        try {
            const endpoint = `/api/post/delete/${post._id.$oid}`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                router.push("/")
            }

        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleRouteUser = () => {
        if (post?.author?._id?.$oid) {
            router.push(`/profile/${post.author._id.$oid}`);
        }
    }

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post?.author?._id?.$oid && post.author._id.$oid !== "[deleted]"&& post.author._id.$oid !== "[anonymous]") {
            router.push(`/profile/${post.author._id.$oid}`);
        }
    }

    useEffect(() => {
        fetchUserPinned()
    }, [pinned, post])

    useEffect(() => {
        getPost();
        fetchUserVotes();
        fetchBlocklist();
    }, []);

    useEffect(() => {
        if (post) {
            setUpvotes(post.upvotes);
            setDownvotes(post.downvotes);
        }
    }, [post]);

    useEffect(() => {
        if (post && userVotes) {
            setCurrentVoteType(userVotes[post._id.$oid]);
        }
    }, [userVotes, post]);

    useEffect(() => {
        if (post?.author) {
            setAuthorProfile(post.author);
            console.log(post.author)
        }
    }, [post]);

    if (!post) return null;

    const authorId = post.author?._id?.$oid;
    const isBlockedByMe = authorId && blocklist.blocked.includes(authorId);
    const hasBlockedMe = authorId && blocklist.blocking.includes(authorId);

    if (isBlockedByMe) {
        return (
            <div className="h-[80vh] w-screen m-5 p-6 bg-secondary-light shadow-md rounded-lg overflow-y-scroll overflow-x-hidden flex flex-col items-center justify-center">
                <h2 className="text-white text-2xl font-bold mb-4">You've blocked this user</h2>
                <p className="text-gray-400 mb-6">You won't see content from users you've blocked.</p>
                <button
                    onClick={handleRouteUser}
                    title="View user profile"
                    disabled={isUnblocking}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                    User Profile
                </button>
            </div>
        );
    }

    if (hasBlockedMe) {
        return (
            <div className="h-[80vh] w-screen m-5 p-6 bg-secondary-light shadow-md rounded-lg overflow-y-scroll overflow-x-hidden flex flex-col items-center justify-center">
                <h2 className="text-white text-2xl font-bold mb-4">You've been blocked by this user</h2>
                <p className="text-gray-400">You can't view this content because the user has blocked you.</p>
                <button
                    onClick={handleRouteUser}
                    title="View user profile"
                    disabled={isUnblocking}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                    User Profile
                </button>
            </div>
        );
    }

    return (
        <div className="h-[80vh] w-screen m-5 p-6 bg-secondary-light shadow-md rounded-lg overflow-x-hidden flex flex-col">
            <div className="flex flex-row justify-between">
                <div className="m-5 break-words max-w-full">
                    <h2 className="text-white text-2xl font-bold mt-4">
                        {post.title}
                    </h2>
                    <div className="flex items-center mb-4">
                        <ProfilePicture profilePicture={authorProfile?.profile_picture_url} userId={authorProfile?._id.$oid}/>
                        <div>
                            <div className="font-semibold text-white" onClick={handleAuthorClick} title="Click to view author profile">
                                {post.author?.username}
                            </div>
                            <div className="text-sm text-gray-600">
                                {authorProfile?.userType === "Mentee" ? (
                                    <span>Student • {authorProfile.major}</span>
                                ) : authorProfile?.userType === "Mentor" ? (
                                    <span>
                                        {authorProfile.company} • {authorProfile.industry}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {post.image_url && (
                        <div className="mt-4 mb-4">
                            <img 
                                src={post.image_url} 
                                alt="Post content" 
                                className="max-w-full h-auto rounded-lg cursor-pointer"
                                title="Click to view image"
                                onClick={() => setIsLightboxOpen(true)}
                            />
                            <Lightbox
                                open={isLightboxOpen}
                                close={() => setIsLightboxOpen(false)}
                                slides={[{ src: post.image_url }]}
                                carousel={{ finite: true }}
                                render={{ 
                                    buttonPrev: () => null,
                                    buttonNext: () => null
                                }}
                            />
                        </div>
                    )}
                    {isEditing 
                        ? <TextEditor 
                            editText={editText} 
                            setEditText={setEditText} 
                            setIsEditing={setIsEditing}
                            handleEditSubmit={handleEditSubmit}/>
                        : <p className="text-white mt-2">{post.content}</p>
                    }
                </div>
                <div>
                    <div className="relative m-5 mt-9 text-white">
                        <button
                            className="cursor font-bold text-2xl opacity-70 hover:opacity-100 transition-opacity duration-200"
                            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
                            title="Toggle post options"
                        >
                            &#8942;
                        </button>
                        {isDropdownVisible && (
                            <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-secondary text-sm">
                                <ul>
                                    {userId === post.author?._id.$oid && (
                                        <li 
                                            className="px-4 py-2 cursor-pointer hover:bg-foreground"
                                            title="Click to edit post"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setIsDropdownVisible(false);
                                            }}
                                        >
                                            Edit Post
                                        </li>
                                    )}
                                    {userId === post.author?._id.$oid && (
                                        <DeleteButton onDelete={handleDelete} setIsDropdownVisible={setIsDropdownVisible}/>
                                    )}
                                    {userId && isAuthenticated && (
                                        <li className="px-4 py-2 cursor-pointer hover:bg-foreground"
                                        title="Click to save post"
                                            onClick={() => {
                                              handleSavePost();
                                              setIsDropdownVisible(false)
                                            }}>
                                            Save Post
                                        </li>
                                    )} 
                                    {userId && isAuthenticated && (
                                        <li
                                            className="px-4 py-2 cursor-pointer hover:bg-foreground"
                                            onClick={pinned ? handleUnpin : handlePin}
                                            title="Click to pin/unpin post"
                                        >
                                            {pinned ? 'Unpin Post' : 'Pin Post'}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mx-3 flex justify-between items-center text-sm text-text-light">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button
                            title="Click to upvote"
                            onClick={() => handleVote("up")}
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                currentVoteType === "up"
                                    ? "text-green-500"
                                    : "text-gray-400 hover:text-green-500"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={currentVoteType === "up" ? "currentColor" : "none"}
                                stroke="currentColor"
                                className="w-5 h-5"
                                strokeWidth={currentVoteType === "up" ? "0" : "2"}
                            >
                                <path d="M4 14h16v2H4v-2zm8-10L4 12h16L12 4z" />
                            </svg>
                            <span>{upvotes}</span>
                        </button>
                        <button
                            onClick={() => handleVote("down")}
                            title="Click to downvote"
                            disabled={isLoading}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                currentVoteType === "down"
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={currentVoteType === "down" ? "currentColor" : "none"}
                                stroke="currentColor"
                                className="w-5 h-5"
                                strokeWidth={currentVoteType === "down" ? "0" : "2"}
                            >
                                <path d="M4 8h16v2H4V8zm8 10l8-8H4l8 8z" />
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

            <CommentSection postId={post_id} postAuthorId={authorProfile ? authorProfile._id.$oid : ""}/>
        </div>
    );
};

export default PostView;