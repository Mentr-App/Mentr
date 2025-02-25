import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LoginPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const endpoint = isLogin ? "../api/login" : "../api/signup";
        const payload = isLogin
            ? { username, password }
            : {
                  username,
                  password,
                  email,
              };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await response.json();

            if (data.access_token && data.refresh_token) {
                login(data.access_token, data.refresh_token);
                onClose();
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-[#262d34] p-8 rounded-lg w-96'>
                <h2 className='text-2xl text-text-primary mb-6'>
                    {isLogin ? "Login" : "Sign Up"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                    />
                    {!isLogin && (
                        <input
                            type='email'
                            placeholder='Email (optional)'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                        />
                    )}
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                    />
                    <button
                        type='submit'
                        className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                {error && <p className='text-primary-dark mt-4'>{error}</p>}
                <p className='text-text-primary mt-4'>
                    {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                    <span
                        className='text-primary cursor-pointer hover:text-primary-dark'
                        onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Login"}
                    </span>
                </p>
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-text-primary text-2xl'>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default LoginPopup;
