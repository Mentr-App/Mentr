import React, { useEffect, useState } from "react";
import FeedService from "@/pages/api/apiService";
import ForumPost from "./ForumPost";

export interface Post {
    id: string;
    title: string;
    content: string;
    author?: string;
    createdAt: string;
}

const Forum: React.FC = () => {
    const [feed, setFeed] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFeed = async () => {
            try {
                const data = await FeedService.fetchFeed();
                console.log("Feed data:", data);
                setFeed(data);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                console.error("Error loading feed:", errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadFeed();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (error) {
        return <div className='text-center text-red-500 p-4'>{error}</div>;
    }

    if (feed.length === 0) {
        return (
            <div className='text-center text-gray-400 p-4'>No posts yet</div>
        );
    }

    return (
        <div className='flex-1 p-6'>
            <div className='max-w-3xl mx-auto space-y-6'>
                {feed.map((post) => (
                    <ForumPost key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default Forum;
