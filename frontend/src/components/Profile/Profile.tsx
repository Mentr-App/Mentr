import { ChartNoAxesColumnDecreasing } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Post } from "../Forum/Forum";
import { Comment } from "../CommonInterfaces/Interfaces";
import ForumPost from "../Forum/ForumPost";
import { getRelativeTime } from '@/lib/timeUtils'

interface ProfileData {
    username: string;
    email?: string;
    created_at?: string;
    bio?: string;
    interests?: string[];
    userType?: "Mentor" | "Mentee";
    major?: string;
    company?: string;
    industry?: string;
    two_factor_enabled?: boolean;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    profile_picture?: string;
}

type ProfileTab = 'profile' | 'posts' | 'comments' | 'savedposts';

interface ProfileProps {
    params?: {
        userID?: string;
    };
}

const Profile: React.FC<ProfileProps> = ({ params }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableUsername, setEditableUsername] = useState<string>("");
    const [editableEmail, setEditableEmail] = useState<string>("");
    const [editableUserType, setEditableUserType] = useState<"Mentor" | "Mentee" | undefined>(undefined);
    const [editableMajor, setEditableMajor] = useState<string>("");
    const [editableCompany, setEditableCompany] = useState<string>("");
    const [editableIndustry, setEditableIndustry] = useState<string>("");
    const [editableLinkedin, setEditableLinkedin] = useState<string>("");
    const [editableInstagram, setEditableInstagram] = useState<string>("");
    const [editableTwitter, setEditableTwitter] = useState<string>("");
    const [editableTwoFactorEnabled, setEditableTwoFactorEnabled] = useState<boolean>(false);
    const [validationWarnings, setValidationWarnings] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [userComments, setUserComments] = useState<Comment[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [blocklist, setBlocklist] = useState<{blocked: string[], blocking: string[], all_block: string[]}>({blocked: [], blocking: [], all_block: []});
    const [checkingBlockStatus, setCheckingBlockStatus] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { logout } = useAuth();
    const { updateProfilePicture } = useProfile();
    const router = useRouter();

    const isOwnProfile = !params?.userID;
    const DEFAULT_PROFILE_PICTURE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    const isLoggedIn = localStorage.getItem("access_token") !== null;
    const [userSavedPosts, setUserSavedPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (!editableEmail || editableEmail.length == 0) {
            setEditableTwoFactorEnabled(false);
        }
    }, [editableEmail]);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (activeTab !== 'savedposts' || !profile) return;
    
            try {
                const userId = localStorage.getItem("userId");
                const response = await fetch(`http://localhost:8000/saved_post/get/?userId=${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
    
                if (!response.ok) throw new Error('Failed to fetch saved posts');
                
                const data = await response.json();
                setUserSavedPosts(data.savedPosts || []);
            } catch (err) {
                console.error("Error fetching saved posts:", err);
            }
        };
    
        fetchSavedPosts();
    }, [activeTab, profile]);
    


    useEffect(() => {
        const fetchBlocklist = async () => {
            if (isOwnProfile) {
                setCheckingBlockStatus(false);
                return;
            }

            try {
                const access_token = localStorage.getItem("access_token");
                if (!access_token) {
                    setCheckingBlockStatus(false);
                    return;
                }

                const response = await fetch("/api/profile/getBlockList", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBlocklist(data);
                }
            } catch (err) {
                console.error("Failed to fetch blocklist:", err);
            } finally {
                setCheckingBlockStatus(false);
            }
        };

        fetchBlocklist();
    }, [params?.userID, isOwnProfile]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                let endpoint, headers = {};
                
                if (isOwnProfile) {
                    endpoint = "/api/profile/getProfile";
                    const access_token = localStorage.getItem("access_token");
                    headers = {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    };
                } else {
                    endpoint = `/api/profile/getPublicProfile?userID=${params?.userID}`;
                }

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: headers,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to find user");
                }
                const userData = await response.json();
                
                let profilePictureUrl = null;
                if (isOwnProfile) {
                    const pictureResponse = await fetch("/api/profile/getProfilePicture", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                            "Content-Type": "application/json",
                        },
                    });
                    
                    if (pictureResponse.ok) {
                        const pictureData = await pictureResponse.json();
                        profilePictureUrl = pictureData.profile_picture_url;
                    }
                } else {
                    profilePictureUrl = userData.profile_picture;
                }

                const profileData: ProfileData = {
                    username: userData["username"],
                    email: isOwnProfile ? userData["email"] : undefined,
                    created_at: isOwnProfile ? userData["created_at"]["$date"] : undefined,
                    userType: userData["userType"],
                    major: userData["major"],
                    company: userData["company"],
                    industry: userData["industry"],
                    linkedin: userData["linkedin"],
                    instagram: userData["instagram"],
                    twitter: userData["twitter"],
                    two_factor_enabled: isOwnProfile ? userData["two_factor_enabled"] : undefined,
                    profile_picture: profilePictureUrl,
                };
                setProfile(profileData);
                
                if (isOwnProfile) {
                    setEditableUsername(profileData.username);
                    setEditableEmail(profileData.email || "");
                    setEditableUserType(profileData.userType || undefined);
                    setEditableMajor(profileData.major || "");
                    setEditableCompany(profileData.company || "");
                    setEditableIndustry(profileData.industry || "");
                    setEditableLinkedin(profileData.linkedin || "");
                    setEditableInstagram(profileData.instagram || "");
                    setEditableTwitter(profileData.twitter || "");
                    setEditableTwoFactorEnabled(profileData.two_factor_enabled || false);
                }
                
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setLoading(false);
            }
        };

        loadProfile();
    }, [params?.userID, isOwnProfile]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (activeTab !== 'posts' || !profile) return;
            
            try {
                setPostsLoading(true);
                const response = await fetch(`/api/profile/getUserPosts?username=${profile.username}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user posts');
                }

                const data = await response.json();
                const sortedPosts = [...data].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setUserPosts(sortedPosts || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch user posts');
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserPosts();
    }, [activeTab, profile]);

    useEffect(() => {
        const fetchUserComments = async () => {
            if (activeTab !== 'comments' || !profile) return;
            
            try {
                setCommentsLoading(true);
                const response = await fetch(`/api/profile/getUserComments?username=${profile.username}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user comments');
                }

                const data = await response.json();
                const sortedComments = [...data].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setUserComments(sortedComments || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch user comments');
            } finally {
                setCommentsLoading(false);
            }
        };

        fetchUserComments();
    }, [activeTab, profile]);

    const handleSaveChanges = async () => {
        const warnings: { [key: string]: string } = {};

        if (editableLinkedin && !editableLinkedin.includes("linkedin.com/in")) {
            warnings.linkedin = "LinkedIn URL must contain 'linkedin.com/in'.";
        }
        if (editableInstagram && !editableInstagram.includes("instagram.com")) {
            warnings.instagram = "Instagram URL must contain 'instagram.com'.";
        }
        if (editableTwitter && !editableTwitter.includes("twitter.com")) {
            warnings.twitter = "Twitter URL must contain 'twitter.com'.";
        }

        setValidationWarnings(warnings);

        if (Object.keys(warnings).length > 0) {
            return;
        }

        if (profile) {
            setProfile({
                ...profile,
                username: editableUsername,
                email: editableEmail,
                userType: editableUserType,
                major: editableMajor,
                company: editableCompany,
                industry: editableIndustry,
                linkedin: editableLinkedin,
                instagram: editableInstagram,
                twitter: editableTwitter,
                two_factor_enabled: editableTwoFactorEnabled,
            });
        }

        try {
            const endpoint = "/api/profile/setProfile";
            const access_token = localStorage.getItem("access_token");
            const payload = {
                username: editableUsername,
                email: editableEmail,
                userType: editableUserType,
                major: editableUserType === "Mentee" ? editableMajor : undefined,
                company: editableUserType === "Mentor" ? editableCompany : undefined,
                industry: editableUserType === "Mentor" ? editableIndustry : undefined,
                linkedin: editableLinkedin,
                instagram: editableInstagram,
                twitter: editableTwitter,
                two_factor_enabled: editableTwoFactorEnabled,
            };
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
                throw new Error(errorData.message || "Failed to set profile");
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }

        setIsEditing(false);
    };

    const handleResetPassword = () => {
        router.push('/reset_password');
    };

    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

        if (!isConfirmed) {
            return;
        }
        try {
            const endpoint = "/api/profile/deleteProfile";
            const access_token = localStorage.getItem("access_token");
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete profile");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
        logout();
        router.push("/");
    };

    const handleUnlinkSocialMedia = async (field: keyof ProfileData) => {
        try {
            const endpoint = "/api/profile/setProfile";
            const access_token = localStorage.getItem("access_token");
            const payload = {
                "email": editableEmail,
                "instagram": editableInstagram,
                "linkedin": editableLinkedin,
                "twitter": editableTwitter,
                "two_factor_enabled": editableTwoFactorEnabled,
            };
            switch (field) {
                case "email":
                    setEditableEmail("");
                    payload["email"] = "";
                    payload["two_factor_enabled"] = false;
                    break;
                case "instagram":
                    setEditableInstagram("");
                    payload["instagram"] = "";
                    break;
                case "linkedin":
                    setEditableLinkedin("");
                    payload["linkedin"] = "";
                    break;
                case "twitter":
                    setEditableTwitter("");
                    payload["twitter"] = "";
                    break;
            }
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
                throw new Error(errorData.message || "Failed to unlink account");
            }

            setProfile((prevProfile) => ({
                ...prevProfile!,
                [field]: "",
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const access_token = localStorage.getItem("access_token");
            const response = await fetch('/api/profile/uploadProfilePicture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload profile picture');
            }

            const data = await response.json();

            const pictureResponse = await fetch("/api/profile/getProfilePicture", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            });
            
            if (pictureResponse.ok) {
                const pictureData = await pictureResponse.json();
                setProfile(prev => prev ? { ...prev, profile_picture: pictureData.profile_picture_url } : null);
                updateProfilePicture(pictureData.profile_picture_url);
            }
            
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleVoteUpdate = (postId: string, voteType: "up" | "down" | null, newUpvotes: number, newDownvotes: number) => {
        setUserPosts(prev => prev.map(post => 
            post._id.$oid === postId 
                ? { ...post, upvotes: newUpvotes, downvotes: newDownvotes } 
                : post
        ));
    };

    const handlePostClick = (post: Post) => {
        router.push("/post/" + post._id);
    };

    const handleCommentClick = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    const handleBlockUser = async () => {
        if (!params?.userID) return;
        
        const isConfirmed = window.confirm(`Are you sure you want to block ${profile?.username}? You won't be able to see their posts or comments.`);
        
        if (!isConfirmed) {
            return;
        }
        
        try {
            const endpoint = "/api/profile/addToBlocklist";
            const access_token = localStorage.getItem("access_token");
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    blockedUserID: params.userID
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to block user");
            }
    
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while blocking the user");
        }
    };

    const handleUnblockUser = async () => {
        if (!params?.userID) return;
        
        try {
            const endpoint = "/api/profile/removeFromBlocklist";
            const access_token = localStorage.getItem("access_token");
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    blockedUserID: params.userID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to unblock user");
            }

            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while unblocking the user");
        }
    };

    if (!isOwnProfile && !checkingBlockStatus) {
        if (blocklist.blocked.includes(params?.userID || "")) {
            return (
                <div className="bg-secondary rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">
                        You've blocked this user
                    </h1>
                    <p className="text-text-secondary mb-6">
                        You won't see any content from this user while they're blocked.
                    </p>
                    <button
                        onClick={handleUnblockUser}
                        className="px-4 py-2 bg-primary text-text-primary rounded hover:bg-primary-dark transition-colors"
                    >
                        Unblock User
                    </button>
                </div>
            );
        }
        
        if (blocklist.blocking.includes(params?.userID || "")) {
            return (
                <div className="bg-secondary rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">
                        You've been blocked by this user
                    </h1>
                    <p className="text-text-secondary">
                        You can't view this profile because the user has blocked you.
                    </p>
                </div>
            );
        }
    }

    if (loading) return (
        <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
    );

    if (error) return (
        <div className='text-red-500 text-center p-4'>Error: {error}</div>
    );

    if (!profile) return (
        <div className='text-text-secondary text-center p-4'>Profile not found</div>
    );

    return (
        <div className='bg-secondary rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6 h-[42px]'>
                <h1 className='text-2xl font-bold text-text-primary'>
                    {isOwnProfile ? 'Profile Settings' : `${profile.username}'s Profile`}
                </h1>
                <div className="flex gap-2">
                    {!isOwnProfile && isLoggedIn && (
                        <button
                            onClick={handleBlockUser}
                            title="Click to block this user"
                            className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'
                        >
                            Block
                        </button>
                    )}
                    {isOwnProfile && activeTab === 'profile' && (
                        <div className='w-[120px]'>
                            <button
                                title="Click to modify your profile"
                                onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                                className='px-4 py-2 bg-primary text-text-primary rounded hover:bg-primary-dark transition-colors w-full'
                            >
                                {isEditing ? "Save Changes" : "Edit Profile"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col items-center mb-4">
                <div className="relative w-32 h-32 mb-4">
                    <div className="relative w-32 h-32">
                        <Image
                            src={profile.profile_picture || DEFAULT_PROFILE_PICTURE}
                            alt="Profile"
                            className="rounded-full object-cover"
                            fill
                            sizes="128px"
                            priority
                        />
                    </div>
                </div>
                
                {isOwnProfile && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileInput}
                            title="Click to upload a new profile picture"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
                        >
                            {profile?.profile_picture ? 'Change Profile Picture' : 'Add Profile Picture'}
                        </button>
                    </>
                )}

                <div className="flex border-b border-gray-200 w-full mb-4">
                    <button
                        className={`py-2 px-4 font-medium text-base focus:outline-none ${
                            activeTab === 'profile' 
                                ? 'border-b-2 border-primary text-primary' 
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                        title="Click to view your profile"
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-base focus:outline-none ${
                            activeTab === 'posts' 
                                ? 'border-b-2 border-primary text-primary' 
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => setActiveTab('posts')}
                        title="Click to view your posts"
                    >
                        Posts
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-base focus:outline-none ${
                            activeTab === 'comments' 
                                ? 'border-b-2 border-primary text-primary' 
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => setActiveTab('comments')}
                        title="Click to view your comments"
                    >
                        Comments
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-base focus:outline-none ${
                            activeTab === 'savedposts' 
                                ? 'border-b-2 border-primary text-primary' 
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => setActiveTab('savedposts')}
                        title="Click to view your saved posts"
                    >
                        Saved Posts
                    </button>
                </div>
            </div>

            <div className='space-y-4'>
                {activeTab === 'profile' && (
                    <div className='bg-foreground p-4 rounded'>
                        <h2 className='text-lg font-semibold text-text-primary mb-4'>User Information</h2>
                        <div className='flex space-x-6'>
                            <div className='w-1/2 space-y-4'>
                                <div className='space-y-2'>
                                    <label className='block text-text-light'>Username</label>
                                    {isOwnProfile && isEditing ? (
                                        <input
                                            type='text'
                                            title="Click to edit your username"
                                            value={editableUsername}
                                            onChange={(e) => setEditableUsername(e.target.value)}
                                            className='w-full bg-background text-text-primary p-2 rounded'
                                        />
                                    ) : (
                                        <p className='text-text-primary'>{profile.username}</p>
                                    )}
                                    {isOwnProfile && (
                                        <button
                                            onClick={handleResetPassword}
                                            title="Click to reset your password"
                                            className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                            Reset Password
                                        </button>
                                    )}
                                </div>
                                
                                {!isOwnProfile && (
                                    <>
                                        <div className='space-y-2'>
                                            <label className='block text-text-light'>User Type</label>
                                            <p className='text-text-primary'>{profile.userType}</p>
                                        </div>
                                        {profile.userType === "Mentee" && profile.major && (
                                            <div className='space-y-2'>
                                                <label className='block text-text-light'>Major</label>
                                                <p className='text-text-primary'>{profile.major}</p>
                                            </div>
                                        )}
                                        {profile.userType === "Mentor" && profile.company && (
                                            <div className='space-y-2'>
                                                <label className='block text-text-light'>Company</label>
                                                <p className='text-text-primary'>{profile.company}</p>
                                            </div>
                                        )}
                                        {profile.userType === "Mentor" && profile.industry && (
                                            <div className='space-y-2'>
                                                <label className='block text-text-light'>Industry</label>
                                                <p className='text-text-primary'>{profile.industry}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isOwnProfile && (
                                    <div className='space-y-2'>
                                        <label className='block text-text-light'>Email</label>
                                        {isEditing ? (
                                            <input
                                                type='email'
                                                title="Edit your email"
                                                value={editableEmail}
                                                onChange={(e) => setEditableEmail(e.target.value)}
                                                className='w-full bg-background text-text-primary p-2 rounded'
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <p className='text-text-primary'>{profile.email}</p>
                                                {profile.email && (
                                                    <button
                                                        title="Click to unlink your email"
                                                        onClick={() => handleUnlinkSocialMedia("email")}
                                                        className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                        Unlink
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isOwnProfile && profile.created_at && (
                                    <div className='space-y-2'>
                                        <label className='block text-text-light'>Member Since</label>
                                        <p className='text-text-primary'>
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </p>
                                        {isOwnProfile && (
                                            <button
                                                onClick={handleDeleteAccount}
                                                title="Click to delete your account"
                                                className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                Delete Account
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='w-1/2 space-y-4'>
                                {isOwnProfile && (
                                    <>
                                        <div className='space-y-2'>
                                            <label className='block text-text-light'>User Type</label>
                                            {isEditing ? (
                                                <select
                                                    value={editableUserType || ""}
                                                    title="Click to edit your user type"
                                                    onChange={(e) => setEditableUserType(e.target.value as "Mentor" | "Mentee")}
                                                    className='w-full bg-background text-text-primary p-2 rounded'
                                                >
                                                    <option value="" disabled>Select user type</option>
                                                    <option value="Mentor">Mentor</option>
                                                    <option value="Mentee">Mentee</option>
                                                </select>
                                            ) : (
                                                <p className='text-text-primary'>{profile.userType}</p>
                                            )}
                                        </div>
                                        {profile.userType === "Mentee" && (
                                            <div className='space-y-2'>
                                                <label className='block text-text-light'>Major</label>
                                                {isEditing ? (
                                                    <input
                                                        type='text'
                                                        title="Click to edit your major"
                                                        value={editableMajor}
                                                        onChange={(e) => setEditableMajor(e.target.value)}
                                                        className='w-full bg-background text-text-primary p-2 rounded'
                                                    />
                                                ) : (
                                                    <p className='text-text-primary'>{profile.major}</p>
                                                )}
                                            </div>
                                        )}
                                        {profile.userType === "Mentor" && (
                                            <>
                                                <div className='space-y-2'>
                                                    <label className='block text-text-light'>Company</label>
                                                    {isEditing ? (
                                                        <input
                                                            type='text'
                                                            title="Click to edit your company"
                                                            value={editableCompany}
                                                            onChange={(e) => setEditableCompany(e.target.value)}
                                                            className='w-full bg-background text-text-primary p-2 rounded'
                                                        />
                                                    ) : (
                                                        <p className='text-text-primary'>{profile.company}</p>
                                                    )}
                                                </div>
                                                <div className='space-y-2'>
                                                    <label className='block text-text-light'>Industry</label>
                                                    {isEditing ? (
                                                        <input
                                                            type='text'
                                                            title="Click to edit your industry"
                                                            value={editableIndustry}
                                                            onChange={(e) => setEditableIndustry(e.target.value)}
                                                            className='w-full bg-background text-text-primary p-2 rounded'
                                                        />
                                                    ) : (
                                                        <p className='text-text-primary'>{profile.industry}</p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {isOwnProfile && (
                                    <div className='space-y-2'>
                                        <label className='block text-text-light'>Two-Factor Authentication</label>
                                        <button
                                            onClick={(e) => {
                                                if (isEditing && editableEmail) {
                                                    setEditableTwoFactorEnabled(!editableTwoFactorEnabled);
                                                }
                                            }}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                                editableTwoFactorEnabled ? 'bg-primary' : 'bg-gray-300'
                                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!isEditing}
                                        >
                                            <span
                                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                    editableTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                        <p className='text-text-primary'>
                                            title="Click to toggle two-factor authentication"
                                            {editableTwoFactorEnabled ? "Enabled" : "Disabled"}
                                        </p>
                                    </div>
                                )}

                                <div className='space-y-2'>
                                    <label className='block text-text-light'>LinkedIn</label>
                                    {isOwnProfile && isEditing ? (
                                        <>
                                            <input
                                                type='text'
                                                title="Click to edit your LinkedIn URL"
                                                value={editableLinkedin}
                                                onChange={(e) => setEditableLinkedin(e.target.value)}
                                                className='w-full bg-background text-text-primary p-2 rounded'
                                            />
                                            {validationWarnings.linkedin && (
                                                <p className="text-sm text-red-500">{validationWarnings.linkedin}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className='text-text-primary'>{profile.linkedin || 'Not provided'}</p>
                                            {isOwnProfile && profile.linkedin && !isEditing && (
                                                <button
                                                    title="Click to unlink your LinkedIn account"
                                                    onClick={() => handleUnlinkSocialMedia("linkedin")}
                                                    className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                    Unlink
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <label className='block text-text-light'>Instagram</label>
                                    {isOwnProfile && isEditing ? (
                                        <>
                                            <input
                                                type='text'
                                                title="Click to edit your Instagram URL"
                                                value={editableInstagram}
                                                onChange={(e) => setEditableInstagram(e.target.value)}
                                                className='w-full bg-background text-text-primary p-2 rounded'
                                            />
                                            {validationWarnings.instagram && (
                                                <p className="text-sm text-red-500">{validationWarnings.instagram}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className='text-text-primary'>{profile.instagram || 'Not provided'}</p>
                                            {isOwnProfile && profile.instagram && !isEditing && (
                                                <button
                                                    onClick={() => handleUnlinkSocialMedia("instagram")}
                                                    title="Click to unlink your Instagram account"
                                                    className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                    Unlink
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <label className='block text-text-light'>Twitter</label>
                                    {isOwnProfile && isEditing ? (
                                        <>
                                            <input
                                                type='text'
                                                value={editableTwitter}
                                                title="Click to edit your Twitter URL"
                                                onChange={(e) => setEditableTwitter(e.target.value)}
                                                className='w-full bg-background text-text-primary p-2 rounded'
                                            />
                                            {validationWarnings.twitter && (
                                                <p className="text-sm text-red-500">{validationWarnings.twitter}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className='text-text-primary'>{profile.twitter || 'Not provided'}</p>
                                            {isOwnProfile && profile.twitter && !isEditing && (
                                                <button
                                                    onClick={() => handleUnlinkSocialMedia("twitter")}
                                                    title="Click to unlink your Twitter account"
                                                    className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                    Unlink
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className='bg-foreground p-4 rounded'>
                        <h2 className='text-lg font-semibold text-text-primary mb-4'>
                            {isOwnProfile ? 'Your Posts' : `${profile.username}'s Posts`}
                        </h2>
                        {postsLoading ? (
                            <div className='flex justify-center items-center h-32'>
                                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
                            </div>
                        ) : userPosts.length > 0 ? (
                            <div className="space-y-4">
                                {userPosts.map((post) => (
                                    <ForumPost
                                        key={post._id.$oid}
                                        post={post}
                                        currentVoteType={null}
                                        onVoteUpdate={handleVoteUpdate}
                                        onClick={() => handlePostClick(post)}
                                        title="Click to view this post"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-text-secondary py-8">
                                <p>No posts to display</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className='bg-foreground p-4 rounded'>
                        <h2 className='text-lg font-semibold text-text-primary mb-4'>
                            {isOwnProfile ? 'Your Comments' : `${profile.username}'s Comments`}
                        </h2>
                        {commentsLoading ? (
                            <div className='flex justify-center items-center h-32'>
                                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
                            </div>
                        ) : userComments.length > 0 ? (
                            <div className="space-y-4">
                                {userComments.map((comment) => (
                                    <div 
                                        key={comment._id.$oid} 
                                        className="bg-background p-4 rounded-lg cursor-pointer hover:bg-background-dark transition-colors"
                                        onClick={() => comment.post_id && handleCommentClick(comment.post_id)}
                                        title="Click to view this comment"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-primary font-medium">
                                                {profile?.username}
                                            </h3>
                                            <span className="text-xs text-text-secondary">
                                                {getRelativeTime(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-text-primary">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-text-secondary py-8">
                                <p>No comments to display</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'savedposts' && (
                    <div className='bg-foreground p-4 rounded'>
                        <h2 className='text-lg font-semibold text-text-primary mb-4'>
                            {isOwnProfile ? 'Your Saved Posts' : `${profile.username}'s Saved Posts`}
                        </h2>
                        {postsLoading ? (
                            <div className='flex justify-center items-center h-32'>
                                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
                            </div>
                        ) : userSavedPosts.length > 0 ? (
                            <div className="space-y-4">
                                {userSavedPosts.map((post) => (
                                    <div key={post._id.$oid} className="space-y-2">
                                        <ForumPost
                                            post={post}
                                            currentVoteType={null}
                                            onVoteUpdate={handleVoteUpdate}
                                            onClick={() => handlePostClick(post)}
                                            hideDate={true}
                                            title="Click to view this post"
                                        />
                                        <div className="text-right">
                                            <button
                                                className="text-sm text-red-500 hover:text-red-700 underline"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const userId = localStorage.getItem("userId");
                                                        await fetch(`http://localhost:8000/saved_post/unsave/`, {
                                                            method: "DELETE",
                                                            headers: {
                                                              "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                              userId: localStorage.getItem("userId"),
                                                              postId: post._id?.$oid || post._id,
                                                            }),
                                                          });
                                                          setUserSavedPosts(prev =>
                                                            prev.filter(p => (p._id?.$oid || p._id) !== (post._id?.$oid || post._id))
                                                          );
                                                    } catch (err) {
                                                        console.error("Failed to unsave post:", err);
                                                    }
                                                }}
                                            >
                                                Unsave Post
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-text-secondary py-8">
                                <p>No posts to display</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;