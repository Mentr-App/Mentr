import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRelativeTime } from "@/lib/timeUtils";
import CommentItem from "./Comment";
import {Comment, Author} from "../CommonInterfaces/Interfaces"


// Helper function to get author username
const getAuthorName = (author: string | Author): string => {
    if (typeof author === "string") {
        return author;
    }
    return author.username || "Anonymous";
};

interface CommentInputProps {
    postId: string;
    onCommentAdded: (comment: Comment) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ postId, onCommentAdded }) => {
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { isAuthenticated, setIsPopupVisible } = useAuth();

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!comment.trim()) return;

        if (!isAuthenticated) {
            setIsPopupVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/post/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ content: comment }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit comment");
            }

            const data = await response.json();
            onCommentAdded(data.comment);
            setComment(""); // Clear the input after submitting
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='mt-5 relative flex flex-col p-4 bg-none rounded-lg'>
            <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder='Write a comment...'
                disabled={isSubmitting}
                className={`p-3 ${
                    comment.trim() ? "mb-10" : "mb-0"
                } mb-10 border focus:outline-none border-secondary rounded-md resize-none bg-secondary text-white`}
                rows={4}
            />
            {comment.trim() && (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className='absolute bottom-2 right-4 px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50'>
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            )}
        </div>
    );
};

interface CommentListProps {
    postId: string;
}

const CommentSection: React.FC<CommentListProps> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/post/${postId}/comments`);

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const handleCommentAdded = (newComment: Comment) => {
        setComments((prev) => [...prev, newComment]);
    };

    return (
        <div className='mt-8'>
            <h3 className='text-xl font-semibold text-white mb-4'>Comments</h3>

            {loading ? (
                <div className='text-gray-400'>Loading comments...</div>
            ) : error ? (
                <div className='text-red-500'>{error}</div>
            ) : comments.length === 0 ? (
                <div className='text-gray-400'>
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className='space-y-4 mb-6'>
                    {comments.map((item, index) => (
                        <CommentItem comment={item} index={index} getAuthorName={getAuthorName}/>
                    ))}
                </div>
            )}

            <CommentInput postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
    );
};

export default CommentSection;
