import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    isPopupVisible: boolean;
    setIsPopupVisible: (React.Dispatch<React.SetStateAction<boolean>>);
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    userType: "Mentor" | "Mentee" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false)
    const [userType, setUserType] = useState<"Mentor" | "Mentee" | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsAuthenticated(!!token);

        const handleAuthChange = (e: Event) => {
            const authEvent = e as CustomEvent;
            if (authEvent.detail.type === "signin") {
                setIsAuthenticated(true);
            } else if (authEvent.detail.type === "signout") {
                setIsAuthenticated(false);
            }
        };

        window.addEventListener("authStateChange", handleAuthChange);
        return () => {
            window.removeEventListener("authStateChange", handleAuthChange);
        };
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        setIsAuthenticated(true);
        loadProfile()
        window.dispatchEvent(
            new CustomEvent("authStateChange", {
                detail: { type: "signin" },
            })
        );
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        window.dispatchEvent(
            new CustomEvent("authStateChange", {
                detail: { type: "signout" },
            })
        );
    };

    const loadProfile = async () => {
        try {
            const endpoint = "/api/profile/getProfile"
            const access_token = localStorage.getItem("access_token")
            if (access_token) {
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json"
                    }
                })
    
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to find user")
                }
    
                const userData = await response.json()
                localStorage.setItem("userId", userData._id.$oid)
                setUserType(userData.userType);
            }
        } catch (error) {
            console.log(error)
        }
      }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isPopupVisible, setIsPopupVisible, userType }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
