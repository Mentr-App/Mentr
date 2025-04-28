import React from "react";

// Define available options for the activity dropdown
// (Make sure these match the values expected by your backend filter)
const activityOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Arts & Entertainment",
    "Retail",
    "Manufacturing",
    "Hospitality",
    "Other"
];


// --- Updated Props Interface ---
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
    // --- Add props for activity filter ---
    activity: string; // The current selected activity filter value
    handleActivityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Handler for changes
    // --- End of added props ---
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
    activity,
    handleActivityChange,
}) => {
    return (
        <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
            {/* --- Use flex-wrap for smaller screens --- */}
            <div className='flex flex-wrap items-center gap-4'>
                {/* Posts Per Page Dropdown (Existing) */}
                <div className='flex items-center'>
                    <label
                        htmlFor='posts-per-page'
                        className={`mr-2 text-sm font-medium whitespace-nowrap ${ // Added whitespace-nowrap
                            isSearching ? "opacity-50" : ""
                        }`}
                        style={{ color: "var(--text-primary)" }}>
                        Posts per page:
                    </label>
                    <select
                        id='posts-per-page'
                        title="Change number of posts per page"
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

                {/* Sort By Dropdown (Existing) */}
                <div className='flex items-center'>
                    <label
                        htmlFor='sort-by'
                        className={`mr-2 text-sm font-medium whitespace-nowrap ${ // Added whitespace-nowrap
                            isSearching ? "opacity-50" : ""
                        }`}
                        style={{ color: "var(--text-primary)" }}>
                        Sort by:
                    </label>
                    <select
                        id='sort-by'
                        title="Sort posts by selected criteria"
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
                        <option value='new'>Most Recent</option>
                        <option value='old'>Oldest</option>
                        <option value='top'>Trending</option>
                        <option value='hot'>Most Commented</option>
                        <option value='controversial'>Controversial</option>
                    </select>
                </div>

                {/* --- START: Activity Filter Dropdown --- */}
                <div className='flex items-center'>
                    <label
                        htmlFor='activity-filter'
                        className={`mr-2 text-sm font-medium whitespace-nowrap ${ // Added whitespace-nowrap
                            isSearching ? "opacity-50" : ""
                        }`}
                        style={{ color: "var(--text-primary)" }}>
                        Activity:
                    </label>
                    <select
                        id='activity-filter'
                        title="Filter posts by activity"
                        value={activity}
                        onChange={handleActivityChange}
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
                        {/* Option to clear the filter */}
                        <option value="">All Activities</option>
                        {/* Map over the defined options */}
                        {activityOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                 {/* --- END: Activity Filter Dropdown --- */}

            </div>

            {/* Search Box (Existing - Adjusted width constraints for better flexibility) */}
            <div
                className='flex items-center px-4 py-2 rounded-full w-full md:w-auto md:min-w-[250px] lg:min-w-[300px] shadow-sm flex-grow md:flex-grow-0' // Adjusted width/grow
                style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                }}>
                <input
                    type='text'
                    title="Search posts by title or content"
                    placeholder='Search posts...' // Added ellipsis
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='bg-transparent border-0 outline-none text-base w-full placeholder-[color:var(--text-secondary)]' // Added placeholder color
                    style={{ color: "var(--text-primary)" }}
                />
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 ml-2 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5} // Slightly thinner stroke
                    stroke='currentColor'
                    style={{ color: "var(--primary)" }}>
                    <title>Search icon</title>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' // Updated path for better look
                    />
                </svg>
            </div>

            {/* Grid/List View Toggle (Existing) */}
            <div className='toggle-container shadow-sm flex-shrink-0'> {/* Added flex-shrink-0 */}
                {/* Grid Button */}
                <button
                    onClick={() => setIsGridView(true)}
                    title="Switch to grid view"
                    className={`toggle-button ${
                        isGridView ? "toggle-button-active" : "toggle-button-inactive"
                    }`}>
                    <svg className='toggle-icon' fill='currentColor' viewBox='0 0 20 20'>
                        {/* Grid Icon Path */}
                         <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 1v3h3V4H4zm5 0v3h3V4H9zm5 0v3h3V4h-3zM4 9v3h3V9H4zm5 0v3h3V9H9zm5 0v3h3V9h-3zM4 14v3h3v-3H4zm5 0v3h3v-3H9zm5 0v3h3v-3h-3z"/>
                    </svg>
                    <span className='toggle-text'>Grid</span>
                </button>

                {/* List Button */}
                <button
                    onClick={() => setIsGridView(false)}
                    title="Switch to list view"
                    className={`toggle-button ${
                        !isGridView ? "toggle-button-active" : "toggle-button-inactive"
                    }`}>
                    <svg className='toggle-icon' fill='currentColor' viewBox='0 0 20 20'>
                        {/* List Icon Path */}
                         <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span className='toggle-text'>List</span>
                </button>
            </div>
        </div>
    );
};

export default SearchControls;