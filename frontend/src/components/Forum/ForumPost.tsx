import React from "react";
import { Post } from "./Forum";

interface ForumPostProps {
    post: Post;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        if (diffHours < 24) {
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

    return (
        <div className='bg-secondary rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-semibold text-text-primary mb-2'>
                {post.title}
            </h2>
            <p className='text-text-secondary mb-4'>{post.content}</p>
            <div className='flex justify-between items-center text-sm text-text-light'>
                <span>{post.author || "Anonymous"}</span>
                <span>{getRelativeTime(post.createdAt)}</span>
            </div>
        </div>
    );
};

export default ForumPost;
