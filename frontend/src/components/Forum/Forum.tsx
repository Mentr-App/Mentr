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

    // Track which layout is active (grid or list)
    const [isGridView, setIsGridView] = useState(true);

    useEffect(() => {
        const loadFeed = async () => {
            try {
                const data = await FeedService.fetchFeed();
                setFeed(data);
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
            className='flex-1 p-6'
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

            {isGridView ? (
                // Grid View
                <div className='max-w-7xl mx-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {feed.map((post) => (
                            <ForumPost key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            ) : (
                // List View
                <div className='max-w-3xl mx-auto space-y-6'>
                    {feed.map((post) => (
                        <ForumPost key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Forum;
