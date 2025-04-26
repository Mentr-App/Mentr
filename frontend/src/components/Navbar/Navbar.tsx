import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import logo_img from "@/assets/logo.png";
import profile_img from "@/assets/user.png";
import search_img from "@/assets/search.png";
import chat_img from "@/assets/chat.png";
import create_img from "@/assets/create2.png";
import people_img from "@/assets/people.png";
import LoginPopup from "@/components/LoginPopup/LoginPopup";
import Image from "next/image";

const Navbar: React.FC = () => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const router = useRouter();
    const { isAuthenticated, logout, isPopupVisible, setIsPopupVisible } = useAuth();
    const { profilePicture, updateProfilePicture } = useProfile();

    useEffect(() => {
        const loadProfilePicture = async () => {
            if (isAuthenticated) {
                try {
                    const access_token = localStorage.getItem("access_token");
                    const pictureResponse = await fetch(
                        "/api/profile/getProfilePicture",
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${access_token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (pictureResponse.ok) {
                        const pictureData = await pictureResponse.json();
                        updateProfilePicture(pictureData.profile_picture_url);
                    }
                } catch (error) {
                    console.error("Failed to load profile picture:", error);
                }
            } else {
                updateProfilePicture(null);
            }
        };

        loadProfilePicture();
    }, [isAuthenticated, updateProfilePicture]);

    const handleProfileClick = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const handleSignOut = () => {
        logout();
        setIsDropdownVisible(false);
        router.push("/");
    };

    const handleUserSettings = () => {
        router.push("/profile");
        setIsDropdownVisible(false);
    };

    const handleFAQ = () => {
        router.push("/faq");
        setIsDropdownVisible(false);
    };

    const handleContact = () => {
        router.push("/contact");
        setIsDropdownVisible(false);
    };

    const handleChatClick = () => {
        if (isAuthenticated) {
            router.push("/chat");
            setIsDropdownVisible(false);
        } else {
            setIsPopupVisible(true)
        }
    }

    const handleReqFeature = () => {
        router.push("/requestfeature");
        setIsDropdownVisible(false);
    }

    const handleAbout = () => {
        router.push("/about");
        setIsDropdownVisible(false);
    };

    const handlePrivacyPolicy = () => {
        router.push("/privacypolicy");
        setIsDropdownVisible(false);
    };

    const handleLogoClick = () => {
        router.push("/");
    };

    const handleCreatePost = () => {
        if (isAuthenticated) {
            router.push("/create");
        } else {
            setIsPopupVisible(true);
        }
    };

    return (
        <div
            className='w-full flex items-center justify-between px-[7%] py-4'
            style={{ backgroundColor: "var(--secondary)" }}>
            {/* Logo */}
            <img
                src={logo_img.src}
                alt='Logo'
                className='w-40 cursor-pointer'
                onClick={handleLogoClick}
                title="Go to homepage"
            />

            {/* Navigation Icons */}
            <ul className='flex-1 list-none text-center'>
                <li
                    className='inline-block mx-5 my-2 text-lg cursor-pointer'
                    style={{ color: "var(--text-primary)" }}>
                    <img
                        src={people_img.src}
                        alt='People'
                        className='w-10 opacity-70 hover:opacity-100 transition-opacity duration-200'
                        title="Mentr Matching"
                    />
                </li>
                <li
                    className='inline-block mx-5 my-2 text-lg cursor-pointer'
                    onClick={handleChatClick}
                    style={{ color: "var(--text-primary)" }}>
                    <img
                        src={chat_img.src}
                        alt='Chat'
                        className='w-10 opacity-70 hover:opacity-100 transition-opacity duration-200'
                        title="Chat"
                    />
                </li>
                <li
                    className='inline-block mx-5 my-2 text-lg cursor-pointer'
                    style={{ color: "var(--text-primary)" }}>
                    <img
                        src={create_img.src}
                        alt='Create'
                        onClick={handleCreatePost}
                        className='w-10 opacity-70 hover:opacity-100 transition-opacity duration-200'
                        title="Create Post"
                    />
                </li>
            </ul>

            {/* Search Box */}
            {/* <div
                className='flex items-center px-5 py-2 rounded-full'
                style={{ backgroundColor: "var(--foreground)" }}>
                <input
                    type='text'
                    placeholder='Search'
                    className='bg-transparent border-0 outline-none text-lg max-w-[200px]'
                    style={{
                        color: "var(--text-primary)",
                    }}
                />
                <img
                    src={search_img.src}
                    alt='Search'
                    className='w-6 cursor-pointer'
                />
            </div> */}

            {/* User Icon and Dropdown */}
            <div className='relative'>
                <img
                    src={profilePicture || profile_img.src}
                    alt='Profile'
                    className='w-10 h-10 rounded-full object-cover opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer'
                    onClick={handleProfileClick}
                    title="View More Pages"
                />
                {isDropdownVisible && (
                    <div
                        className='absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50'
                        style={{ backgroundColor: "var(--foreground)" }}>
                        <ul className='py-2'>
                            {isAuthenticated && (
                                <li
                                    className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                    style={{
                                        color: "var(--text-primary)",
                                    }}
                                    title="Click to view your profile"
                                    onClick={handleUserSettings}>
                                    User Settings
                                </li>
                            )}
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                title="Click to view FAQ"
                                onClick={handleFAQ}>
                                Frequently Asked Questions
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                title="Click to request new feature"
                                onClick={handleReqFeature}>
                                Request New Feature
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                title="Click to view about us"
                                onClick={handleAbout}>
                                About Us
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                title="Click to contact us"
                                onClick={handleContact}>
                                Contact Us
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                title="Click to view privacy policy"
                                onClick={handlePrivacyPolicy}>
                                Privacy Policy
                            </li>
                            {!isAuthenticated ? (
                                <li
                                    className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                    style={{
                                        color: "var(--text-primary)",
                                    }}
                                    title="Click to log in"
                                    onClick={() => {
                                        setIsDropdownVisible(false);
                                        setIsPopupVisible(true);
                                    }}>
                                    Log in
                                </li>
                            ) : (
                                <li
                                    className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                    style={{
                                        color: "var(--text-primary)",
                                    }}
                                    title="Click to log out"
                                    onClick={handleSignOut}>
                                    Sign Out
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Login Popup */}
            {isPopupVisible && <LoginPopup onClose={() => setIsPopupVisible(false)} />}
        </div>
    );
};

export default Navbar;
