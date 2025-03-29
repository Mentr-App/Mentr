import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const PostCreator: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "title") {
            setTitle(value);
        } else if (name === "body") {
            setContent(value);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError("You must be logged in to create a post");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const endpoint = "/api/post";
            const access_token = localStorage.getItem("access_token");
            const payload = { title, content };
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create post");
            }

            setTitle("");
            setContent("");
            setImage(null);
            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while creating the post."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='w-[60%] m-5 p-6 bg-secondary shadow-md rounded-lg'>
            <h2 className='text-2xl font-semibold text-left text-white mb-6'>
                Create Post
            </h2>

            {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <div className='relative mb-4'>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        value={title}
                        onChange={handleInputChange}
                        required
                        className='peer mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                    <label
                        htmlFor='title'
                        className={`absolute left-4 text-sm text-gray-500 transform transition-all duration-200 peer-focus:text-indigo-600 ${
                            title ? "top-0 text-xs" : "top-2 text-sm"
                        }`}>
                        Title <span className='text-red-500'>*</span>
                    </label>
                </div>

                {/* Body Input */}
                <div className='relative mb-4'>
                    <textarea
                        id='body'
                        name='body'
                        value={content}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className='peer mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                    <label
                        htmlFor='body'
                        className={`absolute left-4 text-sm text-gray-500 transform transition-all duration-200 peer-focus:text-indigo-600 ${
                            content ? "top-0 text-xs" : "top-2 text-sm"
                        }`}>
                        Body <span className='text-red-500'>*</span>
                    </label>
                </div>

                {/* Image Input */}
                <div className='mb-4'>
                    <label
                        htmlFor='image'
                        className='block text-sm font-medium text-white'>
                        Image
                    </label>
                    <input
                        type='file'
                        id='image'
                        name='image'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='mt-1 block w-30 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                </div>

                <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 mt-4 font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                        isSubmitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}>
                    {isSubmitting ? "Submitting..." : "Create Post"}
                </button>
            </form>
        </div>
    );
};

export default PostCreator;
