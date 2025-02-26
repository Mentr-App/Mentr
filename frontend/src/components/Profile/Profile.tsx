import { ChartNoAxesColumnDecreasing } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProfileData {
    username: string;
    email: string;
    created_at: string;
    bio?: string;
    interests?: string[];
    userType?: "Mentor" | "Mentee";
    major?: string;
    company?: string;
    industry?: string;
    two_factor_enabled: boolean;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
}

const Profile: React.FC = () => {
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
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const endpoint = "/api/profile/getProfile";
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
                    throw new Error(errorData.message || "Failed to find user");
                }
                const userData = await response.json();
                console.log(userData["created_at"]["$date"]);
                console.log(new Date());
                const profileData: ProfileData = {
                    username: userData["username"],
                    email: userData["email"],
                    created_at: userData["created_at"]["$date"],
                    userType: userData["userType"],
                    major: userData["major"],
                    company: userData["company"],
                    industry: userData["industry"],
                    linkedin: userData["linkedin"],
                    instagram: userData["instagram"],
                    twitter: userData["twitter"],
                    two_factor_enabled: userData["two_factor_enabled"]
                };
                setProfile(profileData);
                setEditableUsername(profileData.username);
                setEditableEmail(profileData.email);
                setEditableUserType(profileData.userType || undefined);
                setEditableMajor(profileData.major || "");
                setEditableCompany(profileData.company || "");
                setEditableIndustry(profileData.industry || "");
                setEditableLinkedin(profileData.linkedin || "");
                setEditableInstagram(profileData.instagram || "");
                setEditableTwitter(profileData.twitter || "");
                setEditableTwoFactorEnabled(profileData.two_factor_enabled);
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

    const handleSaveChanges = async () => {
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
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred"
            );
            setLoading(false);
        }

        setIsEditing(false);
    };

    const handleResetPassword = () => {
        //LEO
        console.log("reset");
        router.push('/reset_password');

    };

    const handleDeleteAccount = async () => {
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
            setError(
                err instanceof Error ? err.message : "An error occurred"
            );
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
                [field]: "",
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
                throw new Error(errorData.message || "Failed to unlink account");
            }

            // Update the local state to reflect the change
            setProfile((prevProfile) => ({
                ...prevProfile!,
                [field]: "",
            }));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred"
            );
        }
    };

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
                    onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                    className='px-4 py-2 bg-primary text-text-primary rounded hover:bg-primary-dark transition-colors'>
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            <div className='space-y-6'>
                <div className='bg-foreground p-4 rounded'>
                    <h2 className='text-lg font-semibold text-text-primary mb-4'>
                        User Information
                    </h2>
                    <div className='flex space-x-6'>
                        <div className='w-1/2 space-y-4'>
                            <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    Username
                                </label>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        value={editableUsername}
                                        onChange={(e) => setEditableUsername(e.target.value)}
                                        className='w-full bg-background text-text-primary p-2 rounded'
                                    />
                                ) : (
                                    <p className='text-text-primary'>
                                        {profile.username}
                                    </p>
                                )}
                                <button
                                    onClick={handleResetPassword}
                                    className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                    Reset Password
                                </button>
                            </div>
                            <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type='email'
                                        value={editableEmail}
                                        onChange={(e) => setEditableEmail(e.target.value)}
                                        className='w-full bg-background text-text-primary p-2 rounded'
                                    />
                                ) : (
                                    <p className='text-text-primary'>{profile.email}</p>
                                )}
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
                                <button
                                    onClick={handleDeleteAccount}
                                    className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                        <div className='w-1/2 space-y-4'>
                            <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    User Type
                                </label>
                                {isEditing ? (
                                    <select
                                        value={editableUserType || ""}
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
                            {editableUserType === "Mentee" && (
                                <div className='space-y-2'>
                                    <label className='block text-text-light'>
                                        Major
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type='text'
                                            value={editableMajor}
                                            onChange={(e) => setEditableMajor(e.target.value)}
                                            className='w-full bg-background text-text-primary p-2 rounded'
                                        />
                                    ) : (
                                        <p className='text-text-primary'>{profile.major}</p>
                                    )}
                                </div>
                            )}
                            {editableUserType === "Mentor" && (
                                <>
                                    <div className='space-y-2'>
                                        <label className='block text-text-light'>
                                            Company
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type='text'
                                                value={editableCompany}
                                                onChange={(e) => setEditableCompany(e.target.value)}
                                                className='w-full bg-background text-text-primary p-2 rounded'
                                            />
                                        ) : (
                                            <p className='text-text-primary'>{profile.company}</p>
                                        )}
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='block text-text-light'>
                                            Industry
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type='text'
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
                            <div className='space-y-2'>
                            <label className='block text-text-light'>
                                Two-Factor Authentication
                            </label>
                            <button
                                onClick={(e) => {
                                    if (isEditing) {
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
                                {editableTwoFactorEnabled ? "Enabled" : "Disabled"}
                            </p>
                        </div>
                        <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    LinkedIn
                                </label>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        value={editableLinkedin}
                                        onChange={(e) => setEditableLinkedin(e.target.value)}
                                        className='w-full bg-background text-text-primary p-2 rounded'
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className='text-text-primary'>{profile.linkedin}</p>
                                        {profile.linkedin && (
                                            <button
                                                onClick={() => handleUnlinkSocialMedia("linkedin")}
                                                className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                Unlink
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    Instagram
                                </label>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        value={editableInstagram}
                                        onChange={(e) => setEditableInstagram(e.target.value)}
                                        className='w-full bg-background text-text-primary p-2 rounded'
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className='text-text-primary'>{profile.instagram}</p>
                                        {profile.instagram && (
                                            <button
                                                onClick={() => handleUnlinkSocialMedia("instagram")}
                                                className='px-4 py-2 bg-[var(--red)] text-text-primary rounded hover:bg-[var(--red-dark)] transition-colors'>
                                                Unlink
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <label className='block text-text-light'>
                                    Twitter
                                </label>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        value={editableTwitter}
                                        onChange={(e) => setEditableTwitter(e.target.value)}
                                        className='w-full bg-background text-text-primary p-2 rounded'
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className='text-text-primary'>{profile.twitter}</p>
                                        {profile.twitter && (
                                            <button
                                                onClick={() => handleUnlinkSocialMedia("twitter")}
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
            </div>
        </div>
    );
};

export default Profile;