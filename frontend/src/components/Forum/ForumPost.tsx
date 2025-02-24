import React from "react";
import { Post } from "./Forum";

interface ForumPostProps {
    post: Post;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        console.log(date, now)
        const diffMs = now.getTime() - date.getTime();
        console.log("Ms:",diffMs)
        const diffHours = diffMs / (1000 * 60 * 60);
        console.log("hrs:",diffHours)
        const diffDays = diffHours / 24;
        console.log("days:",diffDays)

        if (diffHours < 0) {
            return "Now"
        }
        else if (diffHours < 24) {
            const hours = Math.floor(diffHours);
            console.log(hours)
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
        <div className='bg-secondary rounded-lg shadow-lg p-6 cursor-pointer hover:bg-secondary-light ease-in-out transition duration-300'>
            <h2 className='text-xl font-semibold text-text-primary mb-2'>
                {post.title}
            </h2>
            <p className='text-text-secondary mb-4'>{post.content}</p>
            <div className='flex justify-between items-center text-sm text-text-light'>
                <span>{post.author || "Anonymous"}</span>
                <span>{getRelativeTime(post.created_at)}</span>
            </div>
        </div>
    );
};

export default ForumPost;
