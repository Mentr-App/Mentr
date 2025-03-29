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
    username: string;
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
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const { isAuthenticated } = useAuth();
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [postsPerPage, setPostsPerPage] = useState<number>(50);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Track which layout is active (grid or list)
    const [isGridView, setIsGridView] = useState(true);

    const router = useRouter();

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
        console.log(post);
        router.push("/post/" + post._id.$oid);
    };

    useEffect(() => {
        fetchUserVotes();
    }, [isAuthenticated]);

    const loadFeed = async (
        isInitialLoad: boolean = false,
        pageNumber: number = page
    ) => {
        // Reset to page 1 if we're not loading more and not on initial load
        if (!isInitialLoad && !loadingMore && pageNumber === page) {
            setPage(1);
            pageNumber = 1;
        }

        const endpoint = `/api/feed?skip=${
            (pageNumber - 1) * postsPerPage
        }&limit=${postsPerPage}`;
        const access_token = localStorage.getItem("access_token");

        try {
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await response.json();
            console.log(data);

            // If we get fewer posts than requested, we've reached the end
            if (data.feed.length < postsPerPage) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            // Calculate total pages based on total_count if available, otherwise estimate
            if (data.total_count) {
                const pages = Math.ceil(data.total_count / postsPerPage);
                setTotalPages(pages);
            } else if (!hasMore) {
                setTotalPages(pageNumber);
            } else {
                setTotalPages(Math.max(totalPages, pageNumber + 1));
            }

            // Update current page
            setPage(pageNumber);

            // Replace feed with new data
            setFeed(data.feed);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadFeed(true);
    }, [postsPerPage]);

    const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value);
        setPostsPerPage(newValue);
    };

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

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        loadFeed(false, newPage);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are less than or equal to maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);

            // Calculate start and end of middle section
            let startPage = Math.max(2, page - Math.floor(maxVisiblePages / 2) + 1);
            let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

            // Adjust if we're near the end
            if (endPage < startPage + 1) {
                startPage = Math.max(2, totalPages - maxVisiblePages + 2);
                endPage = totalPages - 1;
            }

            // Show ellipsis after first page if needed
            if (startPage > 2) {
                pageNumbers.push("...");
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Show ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push("...");
            }

            // Always include last page if not the same as first page
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
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
            <div className='text-center p-4' style={{ color: "var(--primary-dark)" }}>
                {error}
            </div>
        );
    }

    if (feed.length === 0) {
        return (
            <div className='text-center p-4' style={{ color: "var(--text-secondary)" }}>
                No posts yet
            </div>
        );
    }

    return (
        <div
            className='flex-1 p-6 h-[88vh] overflow-scroll'
            style={{ backgroundColor: "var(--background)" }}>
            {/* Header Controls */}
            <div className='flex justify-between items-center mb-4'>
                {/* Posts Per Page Dropdown */}
                <div className='flex items-center'>
                    <label
                        htmlFor='posts-per-page'
                        className='mr-2 text-sm'
                        style={{ color: "var(--text-primary)" }}>
                        Posts per page:
                    </label>
                    <select
                        id='posts-per-page'
                        value={postsPerPage}
                        onChange={handlePostsPerPageChange}
                        className='px-2 py-1 rounded text-sm'
                        style={{
                            backgroundColor: "var(--secondary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border)",
                        }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* Grid/List View Toggle */}
                <div className='toggle-container'>
                    {/* Grid Button */}
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`toggle-button ${
                            isGridView ? "toggle-button-active" : "toggle-button-inactive"
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className='mt-8 flex justify-center items-center'>
                        <div className='flex items-center space-x-2 text-sm'>
                            {/* Previous Page Button */}
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loadingMore}
                                className={`px-3 py-1 rounded ${
                                    page === 1 || loadingMore
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-secondary-light"
                                }`}
                                style={{
                                    backgroundColor: "var(--secondary)",
                                    color: "var(--text-primary)",
                                }}>
                                &lt;
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((pageNum, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        typeof pageNum === "number"
                                            ? handlePageChange(pageNum)
                                            : null
                                    }
                                    disabled={pageNum === "..." || loadingMore}
                                    className={`px-3 py-1 rounded ${
                                        pageNum === page
                                            ? "font-bold"
                                            : pageNum !== "..."
                                            ? "hover:bg-secondary-light"
                                            : ""
                                    }`}
                                    style={{
                                        backgroundColor:
                                            pageNum === page
                                                ? "var(--primary)"
                                                : "var(--secondary)",
                                        color: "var(--text-primary)",
                                        cursor: pageNum === "..." ? "default" : "pointer",
                                    }}>
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Page Button */}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || loadingMore}
                                className={`px-3 py-1 rounded ${
                                    page === totalPages || loadingMore
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-secondary-light"
                                }`}
                                style={{
                                    backgroundColor: "var(--secondary)",
                                    color: "var(--text-primary)",
                                }}>
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forum;
