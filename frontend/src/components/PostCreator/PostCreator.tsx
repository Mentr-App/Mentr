import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Define available options for the dropdown
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

const PostCreator: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [anonymous, setAnonymous] = useState<boolean>(false);
    const [activity, setActivity] = useState<string>("");

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

    // --- Add change handler for the new select field ---
    const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActivity(e.target.value);
    };
    // --- End of new handler ---

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
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
            

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("anonymous", String(anonymous));

            // --- Append the new activity field to FormData ---
            if (activity) { // Only append if an activity is selected
                formData.append("activity", activity);
            }
            // --- End of FormData update ---

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create post");
            }

            setTitle("");
            setContent("");
            setImage(null);
            setImagePreview(null);
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
                <div className='relative mb-4'>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        value={title}
                        title="Title of the post"
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

                <div className='relative mb-4'>
                    <textarea
                        id='body'
                        name='body'
                        title="Content of the post"
                        value={content}
                        onChange={handleInputChange}
                        rows={4}
                        className='peer mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                    <label
                        htmlFor='body'
                        className={`absolute left-4 text-sm text-gray-500 transform transition-all duration-200 peer-focus:text-indigo-600 ${
                            content ? "top-0 text-xs" : "top-2 text-sm"
                        }`}>
                        Body
                    </label>
                </div>

                {/* --- START: New Activity/Industry Dropdown --- */}
                <div className="mb-4">
                    <label
                        htmlFor="activity"
                        className="block text-sm font-medium text-white mb-1" // Adjusted margin
                    >
                        Activity/Industry (optional)
                    </label>
                    <select
                        id="activity"
                        name="activity"
                        value={activity}
                        onChange={handleActivityChange}
                        title="Select the relevant activity or industry"
                        // Apply consistent styling, adjust background/text color for theme
                        className="mt-1 block w-full px-3 py-2 bg-gray-500 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none"
                    >
                        <option value="" disabled>
                            Select an activity...
                        </option>
                        {activityOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                {/* --- END: New Activity/Industry Dropdown --- */}

                {imagePreview && (
                    <div className="mb-4">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            title="Preview of the selected image"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            style={{ maxHeight: '300px' }}
                        />
                    </div>
                )}

                <div className='mb-4'>
                    <label
                        htmlFor='image'
                        className='block text-sm font-medium text-white mb-2'>
                        Image (optional)
                    </label>
                    <input
                        type='file'
                        id='image'
                        name='image'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='block w-full text-sm text-white
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-600 file:text-white
                        hover:file:bg-violet-700
                        focus:outline-none'
                    />
                    {image && (
                        <p className='mt-2 text-sm text-gray-300'>
                            Selected: {image.name}
                        </p>
                    )}
                </div>

                <div className='mb-4'>
                    <label className='inline-flex items-center text-white'>
                        <input
                            type='checkbox'
                            id='anonymous'
                            name='anonymous'
                            checked={anonymous}
                            onChange={(e) => setAnonymous(e.target.checked)}
                            className='form-checkbox h-4 w-4 text-violet-600 border-gray-300 rounded'
                        />
                        <span className='ml-2'>Post anonymously</span>
                    </label>
                </div>

                <button
                    type='submit'
                    title="Click to create post"
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 mt-4 font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                        isSubmitting ? "bg-gray-400" : "bg-violet-600 hover:bg-violet-700"
                    }`}>
                    {isSubmitting ? "Creating..." : "Create Post"}
                </button>
            </form>
        </div>
    );
};

export default PostCreator;
