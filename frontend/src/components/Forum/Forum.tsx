import React, { useEffect, useState } from "react";
import ForumPost from "./ForumPost";
import SearchControls from "./SearchControls";
import Pagination from "./Pagination";
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
    comments?: number;
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
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const { isAuthenticated } = useAuth();
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [postsPerPage, setPostsPerPage] = useState<number>(25);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [originalFeed, setOriginalFeed] = useState<Post[]>([]);

    // State variable to track if we're in search mode
    const [isSearching, setIsSearching] = useState<boolean>(false);
    // State to store all posts for search
    const [allPosts, setAllPosts] = useState<Post[]>([]);

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
            setOriginalFeed(data.feed); // Store original feed for search
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
        setPage(1);
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

    const fetchAllPosts = async () => {
        // Use searchLoading instead of main loading
        setSearchLoading(true);
        try {
            // Request a very large limit to get all posts at once
            const endpoint = `/api/feed?skip=0&limit=1000`;
            const access_token = localStorage.getItem("access_token");

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
            setAllPosts(data.feed);
            return data.feed;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            return [];
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value === "") {
            // Reset to original feed without triggering main loading state
            setIsSearching(false);

            // If we have the original feed cached, use it
            if (originalFeed.length > 0) {
                setFeed(originalFeed);
            } else {
                // Otherwise load the feed again
                loadFeed(true);
            }
            return;
        }

        setIsSearching(true);

        // If this is the first search or we don't have all posts yet, fetch them
        const postsToSearch = allPosts.length > 0 ? allPosts : await fetchAllPosts();

        // Filter based on search query
        const filteredPosts = postsToSearch.filter(
            (post: Post) =>
                post.title.toLowerCase().includes(value.toLowerCase()) ||
                post.content.toLowerCase().includes(value.toLowerCase())
        );

        setFeed(filteredPosts);
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
            <div
                className='flex-1 p-6 h-[88vh]'
                style={{ backgroundColor: "var(--background)" }}>
                {/* Search Controls */}
                <SearchControls
                    postsPerPage={postsPerPage}
                    handlePostsPerPageChange={handlePostsPerPageChange}
                    searchQuery={searchQuery}
                    handleSearchChange={handleSearchChange}
                    isGridView={isGridView}
                    setIsGridView={setIsGridView}
                    isSearching={isSearching}
                />

                {/* Search Loading Indicator */}
                {searchLoading && (
                    <div className='text-center mt-4'>
                        <div
                            className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 mx-auto'
                            style={{ borderColor: "var(--primary)" }}></div>
                        <p className='mt-2' style={{ color: "var(--text-secondary)" }}>
                            Searching...
                        </p>
                    </div>
                )}

                {/* No posts message */}
                {!searchLoading && (
                    <div
                        className='text-center p-4'
                        style={{ color: "var(--text-secondary)" }}>
                        {isSearching ? "No posts match your search" : "No posts yet"}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className='flex-1 p-6 h-[88vh] overflow-scroll'
            style={{ backgroundColor: "var(--background)" }}>
            {/* Search Controls */}
            <SearchControls
                postsPerPage={postsPerPage}
                handlePostsPerPageChange={handlePostsPerPageChange}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                isGridView={isGridView}
                setIsGridView={setIsGridView}
                isSearching={isSearching}
            />

            {/* Search Loading Indicator */}
            {searchLoading && (
                <div className='text-center my-4'>
                    <div
                        className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 mx-auto'
                        style={{ borderColor: "var(--primary)" }}></div>
                    <p className='mt-2' style={{ color: "var(--text-secondary)" }}>
                        Searching...
                    </p>
                </div>
            )}

            {!searchLoading && (
                <div className='flex-1 overflow-y-scroll px-6 pb-6'>
                    {/* Integrated ForumContent */}
                    {isGridView ? (
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

                    {/* Pagination Controls - hide when searching */}
                    {totalPages > 1 && !isSearching && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            loadingMore={loadingMore}
                            onPageChange={handlePageChange}
                            pageNumbers={getPageNumbers()}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Forum;
