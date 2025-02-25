import React, { useState } from "react";

const securityQuestions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?"
];

const LoginPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
    const [securityAnswers, setSecurityAnswers] = useState(["", "", ""]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isLogin && !showSecurityQuestions) {
            if (!username || !password) {
                setError("Username and password are required");
                return;
            }
            setShowSecurityQuestions(true);
            return;
        }

        const endpoint = isLogin ? "../api/login" : "../api/signup";
        const payload = isLogin
            ? { username, password }
            : { 
                username, 
                password, 
                email,
                securityQuestions: securityQuestions.map((question, index) => ({
                    question,
                    answer: securityAnswers[index]
                }))
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
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);
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

    const handleSecurityAnswerChange = (index: number, value: string) => {
        const newAnswers = [...securityAnswers];
        newAnswers[index] = value;
        setSecurityAnswers(newAnswers);
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-[#262d34] p-8 rounded-lg w-96'>
                <h2 className='text-2xl text-text-primary mb-6'>
                    {isLogin ? "Login" : (showSecurityQuestions ? "Security Questions" : "Sign Up")}
                </h2>
                
                {!isLogin && showSecurityQuestions ? (
                    <form onSubmit={handleSubmit}>
                        {securityQuestions.map((question, index) => (
                            <div key={index} className="mb-4">
                                <p className="text-text-primary mb-2">{question}</p>
                                <input
                                    type="text"
                                    placeholder="Your answer"
                                    value={securityAnswers[index]}
                                    onChange={(e) => handleSecurityAnswerChange(index, e.target.value)}
                                    className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded outline-none'
                                />
                            </div>
                        ))}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowSecurityQuestions(false)}
                                className='w-full bg-gray-500 text-text-primary px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200'
                            >
                                Back
                            </button>
                            <button
                                type='submit'
                                className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'
                            >
                                Complete Sign Up
                            </button>
                        </div>
                    </form>
                ) : (
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
                            className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'
                        >
                            {isLogin ? "Login" : "Continue to Security Questions"}
                        </button>
                    </form>
                )}

                {error && <p className='text-primary-dark mt-4'>{error}</p>}

                {!showSecurityQuestions && (
                    <p className='text-text-primary mt-4'>
                        {isLogin
                            ? "Don't have an account? "
                            : "Already have an account? "}
                        <span
                            className='text-primary cursor-pointer hover:text-primary-dark'
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setShowSecurityQuestions(false);
                            }}
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </span>
                    </p>
                )}

                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-text-primary text-2xl'
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default LoginPopup;