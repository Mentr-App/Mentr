import React from "react";

interface SearchControlsProps {
    postsPerPage: number;
    handlePostsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    searchQuery: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isGridView: boolean;
    setIsGridView: (value: boolean) => void;
    isSearching: boolean;
    sortBy: string;
    handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
    postsPerPage,
    handlePostsPerPageChange,
    searchQuery,
    handleSearchChange,
    isGridView,
    setIsGridView,
    isSearching,
    sortBy,
    handleSortChange,
}) => {
    return (
        <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
            <div className='flex items-center gap-4'>
                {/* Posts Per Page Dropdown */}
                <div className='flex items-center'>
                    <label
                        htmlFor='posts-per-page'
                        className={`mr-2 text-sm font-medium ${
                            isSearching ? "opacity-50" : ""
                        }`}
                        style={{ color: "var(--text-primary)" }}>
                        Posts per page:
                    </label>
                    <select
                        id='posts-per-page'
                        value={postsPerPage}
                        onChange={handlePostsPerPageChange}
                        disabled={isSearching}
                        className={`px-3 py-2 rounded-md text-sm shadow-sm ${
                            isSearching
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-opacity-90"
                        }`}
                        style={{
                            backgroundColor: "var(--secondary)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border)",
                        }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* Sort By Dropdown - new component */}
                <div className='flex items-center'>
                    <label
                        htmlFor='sort-by'
                        className={`mr-2 text-sm font-medium ${
                            isSearching ? "opacity-50" : ""
                        }`}
                        style={{ color: "var(--text-primary)" }}>
                        Sort by:
                    </label>
                    <select
                        id='sort-by'
                        value={sortBy}
                        onChange={handleSortChange}
                        disabled={isSearching}
                        className={`px-3 py-2 rounded-md text-sm shadow-sm ${
                            isSearching
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-opacity-90"
                        }`}
                        style={{
                            backgroundColor: "var(--secondary)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border)",
                        }}>
                        <option value='new'>Newest</option>
                        <option value='old'>Oldest</option>
                        <option value='top'>Most Upvoted</option>
                        <option value='hot'>Hot</option>
                        <option value='controversial'>Controversial</option>
                    </select>
                </div>
            </div>

            {/* Search Box */}
            <div
                className='flex items-center px-4 py-2 rounded-full w-full md:w-1/2 lg:w-2/5 max-w-md shadow-sm'
                style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                }}>
                <input
                    type='text'
                    placeholder='Search posts'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='bg-transparent border-0 outline-none text-base w-full'
                    style={{ color: "var(--text-primary)" }}
                />
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 ml-2 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    style={{ color: "var(--primary)" }}>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                </svg>
            </div>

            {/* Grid/List View Toggle */}
            <div className='toggle-container shadow-sm'>
                {/* Grid Button */}
                <button
                    onClick={() => setIsGridView(true)}
                    className={`toggle-button ${
                        isGridView ? "toggle-button-active" : "toggle-button-inactive"
                    }`}>
                    <svg className='toggle-icon' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M3 3h4v4H3V3zm0 10h4v4H3v-4zm10-10h4v4h-4V3zm0 10h4v4h-4v-4z' />
                    </svg>
                    <span className='toggle-text'>Grid</span>
                </button>

                {/* List Button */}
                <button
                    onClick={() => setIsGridView(false)}
                    className={`toggle-button ${
                        !isGridView ? "toggle-button-active" : "toggle-button-inactive"
                    }`}>
                    <svg className='toggle-icon' fill='currentColor' viewBox='0 0 20 20'>
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
    );
};

export default SearchControls;
