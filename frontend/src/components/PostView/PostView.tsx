import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CommentSection from "../CommentSection/CommentSection";
import { getRelativeTime } from "@/lib/timeUtils";
import DeleteButton from "../DeleteConfirmation/DeleteConfirmationProp";
import TextEditor from "../TextEditor/TextEditor";

interface PostViewProps {
    post_id: string;
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
    image_url?: string;
}

interface AuthorObject {
    _id: string;
    username: string;
}

interface IDObject {
    $oid: string;
}

interface UserVotes {
    [postId: string]: "up" | "down";
}

const PostView: React.FC<PostViewProps> = ({ post_id }) => {
    const [post, setPost] = useState<Post | null>(null);
    const { isAuthenticated, setIsPopupVisible } = useAuth();
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const [error, setError] = useState<string | null>(null);
    const [upvotes, setUpvotes] = useState<number>(0);
    const [downvotes, setDownvotes] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentVoteType, setCurrentVoteType] = useState<string | null>(null)
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [editText, setEditText] = useState<string>("")
    const userId = localStorage.getItem("userId")

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
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
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }
          
            const data = await response.json()
            setPost(data.post)
            setEditText(data.post.content)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An unknown error has occurred";
        }
    };

    const handleVote = async (type: "up" | "down") => {
        if (!isAuthenticated) {
            setIsPopupVisible(true);
            return;
        }

        if (!post) {
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
                handleVoteUpdate((post as Post)._id.$oid, data.vote_type);
            }
        } catch (error) {
            console.error("Error voting on post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoteUpdate = (postId: string, newVoteType: "up" | "down" | null) => {
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
    
    const handlePostEditSubmit = async () => {
        if ((!isAuthenticated) || (editText === post?.content) ||
            (editText === "") || (!post)) {
                return
        }

        try {
            const endpoint = `/api/post/edit/${post?._id.$oid}`
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({content: editText})
            })

            if (response.ok) {
                const data = await response.json()
                console.log("edit", data)
                setIsEditing(false)
                setPost(data.post)
            }
        } catch (error) {
            console.error("Error editing post:", error)
        }
    }

    const handleDelete = async() => {
        console.log("meep")
        if (!isAuthenticated) {
            return
        }

        try {
            const endpoint = `/api/post/delete/${post?._id.$oid}`
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                const data = await response.json()
                setPost(data.post)
            }
        } catch (error) {
            console.error("Error deleting posts:", error)
        }
    }

    useEffect(() => {
        getPost()
        fetchUserVotes()
    }, [])

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

    if (!post) return <></>;

    return (
        <div className="h-[80vh] w-screen m-5 p-6 bg-secondary-light shadow-md rounded-lg overflow-y-scroll overflow-x-hidden flex flex-col">
            <div className="flex flex-row justify-between">
                <div className="m-5 break-words max-w-full">
                    <h2 className="text-white text-2xl font-bold mt-4">
                        {post.title}
                    </h2>
                    <h3 className="text-white font-semibold">{post.author?.username ?? "Unknown author"}</h3>
                    {post.image_url && (
                        <div className="mt-4 mb-4 max-w-[600px]">
                            <img 
                                src={post.image_url} 
                                alt="Post content" 
                                className="max-w-full h-auto rounded-lg"
                            />
                        </div>
                    )}
                    {isEditing 
                        ? 
                        // <div className="mt-5 relative flex flex-col p-4 bg-secondary rounded-lg w-[65vw]">
                        //     <textarea
                        //         className="p-3 mb-10 border focus:outline-none border-secondary rounded-md resize-none bg-secondary text-white"
                        //         value={editText}
                        //         onChange={handleEditTextChange}
                        //         rows={4}
                        //     />
                        //     {/* Flex container for buttons */}
                        //     <div className="flex justify-end gap-4">
                        //         <button className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
                        //                 onClick={() => setIsEditing(false)}>
                        //             Cancel
                        //         </button>
                        //         <button className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
                        //                 onClick={handleEditSubmit}>
                        //             Save
                        //         </button>
                        //     </div>
                        // </div>
                        <TextEditor 
                            editText={editText} 
                            setEditText={setEditText} 
                            setIsEditing={setIsEditing}
                            handleEditSubmit={handlePostEditSubmit}/>
                        :
                        <p className="text-white mt-2">{post.content}</p>}
                </div>
                <div>
                    <div className="relative m-5 mt-9 text-white">
                        <button className="cursor font-bold text-2xl opacity-70 hover:opacity-100 transition-opacity duration-200"
                                onClick={() => setIsDropdownVisible(!isDropdownVisible)}
                        >
                            &#8942;
                        </button>
                        {isDropdownVisible && (
                            <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-secondary text-sm">
                                <ul className="">
                                    {
                                        userId === post.author_id.$oid && (
                                            <li className="px-4 py-2 cursor-pointer hover:bg-foreground"
                                                onClick={() => {
                                                    setIsEditing(true)
                                                    if (!isEditing) {
                                                        setEditText(post.content)
                                                    }
                                                    setIsDropdownVisible(false)
                                                }}>
                                                Edit Post
                                            </li>
                                        )
                                    }
                                    {
                                        userId === post.author_id.$oid && (
                                            // <li className="px-4 py-2 cursor-pointer hover:bg-foreground">
                                            //     Delete Post
                                            // </li>
                                            <DeleteButton onDelete={handleDelete} setIsDropdownVisible={setIsDropdownVisible}/>
                                        )
                                    }
                                    <li className="px-4 py-2 cursor-pointer hover:bg-foreground">
                                        Save Post
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
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
                                fill={currentVoteType === "up" ? "currentColor" : "none"}
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={currentVoteType === "up" ? "0" : "2"}>
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
                                    currentVoteType === "down" ? "currentColor" : "none"
                                }
                                stroke='currentColor'
                                className='w-5 h-5'
                                strokeWidth={currentVoteType === "down" ? "0" : "2"}>
                                <path d='M4 8h16v2H4V8zm8 10l8-8H4l8 8z' />
                            </svg>
                            <span>{downvotes}</span>
                        </button>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <span>{post.views} views</span>
                    <span>{getRelativeTime(post.created_at)}</span>
                </div>
            </div>

            {/* Using the updated CommentSection component */}
            <CommentSection postId={post_id} />
        </div>
    );
};

export default PostView;
