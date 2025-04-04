import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    loadingMore: boolean;
    onPageChange: (page: number) => void;
    pageNumbers: (number | string)[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    loadingMore,
    onPageChange,
    pageNumbers,
}) => {
    return (
        <div className='mt-8 flex justify-center items-center'>
            <div className='flex items-center space-x-2 text-sm'>
                {/* Previous Page Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingMore}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1 || loadingMore
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-secondary-light"
                    }`}
                    style={{
                        backgroundColor: "var(--secondary)",
                        color: "var(--text-primary)",
                    }}
                    title="Go to previous page"
                >
                    &lt;
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((pageNum, index) => (
                    <button
                        key={index}
                        onClick={() =>
                            typeof pageNum === "number" ? onPageChange(pageNum) : null
                        }
                        disabled={pageNum === "..." || loadingMore}
                        className={`px-3 py-1 rounded ${
                            pageNum === currentPage
                                ? "font-bold"
                                : pageNum !== "..."
                                ? "hover:bg-secondary-light"
                                : ""
                        }`}
                        style={{
                            backgroundColor:
                                pageNum === currentPage
                                    ? "var(--primary)"
                                    : "var(--secondary)",
                            color: "var(--text-primary)",
                            cursor: pageNum === "..." ? "default" : "pointer",
                        }}
                        title={
                            pageNum === "..."
                                ? "Ellipsis"
                                : pageNum === currentPage
                                ? `Current page: ${pageNum}`
                                : `Go to page ${pageNum}`
                        }
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Next Page Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingMore}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages || loadingMore
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-secondary-light"
                    }`}
                    style={{
                        backgroundColor: "var(--secondary)",
                        color: "var(--text-primary)",
                    }}
                    title="Go to next page"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
