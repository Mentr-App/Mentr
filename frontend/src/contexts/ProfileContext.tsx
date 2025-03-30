import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProfileContextType {
    profilePicture: string | null;
    updateProfilePicture: (url: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    const updateProfilePicture = useCallback((url: string | null) => {
        setProfilePicture(url);
    }, []);

    return (
        <ProfileContext.Provider value={{ profilePicture, updateProfilePicture }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
