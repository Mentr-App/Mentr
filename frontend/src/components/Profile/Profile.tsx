import { ChartNoAxesColumnDecreasing } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ProfileData {
    username: string;
    email: string;
    created_at: string;
    bio?: string;
    interests?: string[];
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const endpoint = "/api/profile";
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
                    throw new Error(errorData.message || "Failed to create post");
                }
                const userData = await response.json();
                console.log(userData["created_at"]["$date"]);
                console.log(new Date());
                const profileData: ProfileData = {
                    username: userData["username"],
                    email: userData["email"],
                    created_at: userData["created_at"]["$date"],
                };
                setProfile(profileData);
                setLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading)
        return (
            <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
            </div>
        );

    if (error)
        return (
            <div className='text-primary-dark text-center p-4'>
                Error: {error}
            </div>
        );

    if (!profile)
        return (
            <div className='text-text-secondary text-center p-4'>
                Profile not found
            </div>
        );

    return (
        <div className='bg-secondary rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-2xl font-bold text-text-primary'>
                    Profile Settings
                </h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className='px-4 py-2 bg-primary text-text-primary rounded hover:bg-primary-dark transition-colors'>
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            <div className='space-y-6'>
                <div className='bg-foreground p-4 rounded'>
                    <h2 className='text-lg font-semibold text-text-primary mb-4'>
                        User Information
                    </h2>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='block text-text-light'>
                                Username
                            </label>
                            {isEditing ? (
                                <input
                                    type='text'
                                    value={profile.username}
                                    className='w-full bg-background text-text-primary p-2 rounded'
                                />
                            ) : (
                                <p className='text-text-primary'>
                                    {profile.username}
                                </p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='block text-text-light'>
                                Email
                            </label>
                            <p className='text-text-primary'>{profile.email}</p>
                        </div>
                        <div className='space-y-2'>
                            <label className='block text-text-light'>
                                Member Since
                            </label>
                            <p className='text-text-primary'>
                                {new Date(
                                    profile.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
