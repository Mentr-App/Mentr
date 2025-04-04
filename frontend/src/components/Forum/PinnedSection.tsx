import React, { useEffect, useState } from "react";
import { Post, UserVotes } from "./Forum";
import ForumPost from "./ForumPost";

interface PinnedSectionProps {
    isGridView: boolean;
    searchLoading: boolean;
    posts: Post[];
    userVotes: UserVotes
    handleVoteUpdate: (postId: string, newVoteType: "up"|"down"|null, newUpvotes: number, newDownvotes: number) => void;
    handlePostClick: (post:Post) => void;
}

const PinnedSection: React.FC<PinnedSectionProps> = ({
    isGridView,
    searchLoading,
    posts,
    userVotes,
    handleVoteUpdate,
    handlePostClick
}) => {
    const [feed, setFeed] = useState<Post[]|null>([])
    const [pinned, setPinned] = useState<string[]>([])
    const userId = localStorage.getItem("userId")

    const fetchUserPinned = async () => {
        if (!userId) {
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
                console.log("pinnes", pinned_posts)
                setPinned(pinned_posts)
            }
        } catch (error) {
            console.error("error getting pinned:", error)
        }
    }

    const getPinnedPosts = () => {
        const pinnedPosts = posts.filter(post => pinned.includes(post._id.$oid));
        console.log(pinnedPosts)
        setFeed(pinnedPosts)
    }

    useEffect(() => {
        getPinnedPosts()
    }, [posts, pinned])

    useEffect(() => {
        fetchUserPinned()
    }, [])

    
    if (searchLoading || !feed || pinned.length == 0) {
        return (
            <></>
        )
    } else {
        return (
            <div className="bg-gray-700 rounded-md p-2 mb-5">
                <h1 className="text-white m-3">Pinned</h1>
                {isGridView ? (
                    <div className="max-w-7xl mx-auto mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {feed.map((post) => (
                                <ForumPost
                                    key={post._id.$oid}
                                    post={post}
                                    currentVoteType={userVotes[post._id.$oid]}
                                    onVoteUpdate={handleVoteUpdate}
                                    onClick={() => handlePostClick(post)}
                                    pinned={true}
                                    setPinned={setPinned}
                                />
                            ))}
                        </div>
                    </div>
                )
                :
                (
                    <div className='max-w-3xl mx-auto space-y-6'>
                    {feed.map((post) => (
                        <ForumPost
                            key={post._id.$oid}
                            post={post}
                            currentVoteType={userVotes[post._id.$oid]}
                            onVoteUpdate={handleVoteUpdate}
                            onClick={() => handlePostClick(post)}
                            pinned={true}
                            setPinned={setPinned}
                        />
                    ))}
                </div>
                )
                }
            </div>
        )
    }
}

export default PinnedSection