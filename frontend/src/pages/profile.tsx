import React from "react";
import Profile from "@/components/Profile/Profile";
import Navbar from "@/components/Navbar/Navbar";

const ProfilePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#1a1f24]">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Profile />
            </div>
        </div>
    );
};

export default ProfilePage;
