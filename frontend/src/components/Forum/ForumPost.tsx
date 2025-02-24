import React from "react";
import { Post } from "./Forum";

interface ForumPostProps {
    post: Post;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
    return (
        <div className="bg-[#262d34] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">
                {post.title}
            </h2>
            <p className="text-gray-300 mb-4">{post.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{post.author || "Anonymous"}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default ForumPost;
