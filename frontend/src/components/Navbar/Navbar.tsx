import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import logo_img from "@/assets/logo.png";
import profile_img from "@/assets/user.png";
import search_img from "@/assets/search.png";
import chat_img from "@/assets/chat.png";
import create_img from "@/assets/create2.png";
import people_img from "@/assets/people.png";
import LoginPopup from "@/components/LoginPopup/LoginPopup";

const Navbar: React.FC = () => {
    // const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const router = useRouter();
    const { isAuthenticated, logout, isPopupVisible, setIsPopupVisible } = useAuth();

    const handleProfileClick = () => {
        // if (isAuthenticated) {
        //     setIsDropdownVisible(!isDropdownVisible);
        // } else {
        //     setIsPopupVisible(true);
        // }
        setIsDropdownVisible(!isDropdownVisible)
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
                    />
                </li>
                <li
                    className='inline-block mx-5 my-2 text-lg cursor-pointer'
                    style={{ color: "var(--text-primary)" }}>
                    <img
                        src={chat_img.src}
                        alt='Chat'
                        className='w-10 opacity-70 hover:opacity-100 transition-opacity duration-200'
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
                    />
                </li>
            </ul>

            {/* Search Box */}
            <div
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
            </div>

            {/* User Icon and Dropdown */}
            <div className='relative'>
                <img
                    src={profile_img.src}
                    alt='User'
                    className='w-8 cursor-pointer ml-10 opacity-60 hover:opacity-100 transition-opacity duration-200'
                    onClick={handleProfileClick}
                />
                {isDropdownVisible && (
                    <div
                        className='absolute right-0 mt-2 w-48 rounded-lg shadow-lg'
                        style={{ backgroundColor: "var(--foreground)" }}>
                        <ul className='py-2'>
                            {isAuthenticated &&
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handleUserSettings}>
                                User Settings
                            </li>
                            }           
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handleFAQ}>
                                Frequently Asked Questions
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handleAbout}>
                                About Us
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handleContact}>
                                Contact Us
                            </li>
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handlePrivacyPolicy}>
                                Privacy Policy
                            </li>
                            {!isAuthenticated ?
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={() => {
                                    setIsDropdownVisible(false)
                                    setIsPopupVisible(true)
                                    }}>
                                Log in
                            </li>
                            :
                            <li
                                className='px-4 py-2 cursor-pointer hover:bg-[var(--secondary-light)]'
                                style={{
                                    color: "var(--text-primary)",
                                }}
                                onClick={handleSignOut}>
                                Sign Out
                            </li>
                            }
                        </ul>
                    </div>
                )}
            </div>

            {/* Login Popup */}
            {isPopupVisible && (
                <LoginPopup onClose={() => setIsPopupVisible(false)} />
            )}
        </div>
    );
};

export default Navbar;
