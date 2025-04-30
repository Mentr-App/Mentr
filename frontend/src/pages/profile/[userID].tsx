import { useRouter } from "next/router";
import Profile from "@/components/Profile/Profile";
import React from "react";

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { userID } = router.query;

    return (
        <div className='container mx-auto px-4 py-8'>
            <Profile params={{ userID: userID as string }} />
        </div>
    );
};

export default ProfilePage;
