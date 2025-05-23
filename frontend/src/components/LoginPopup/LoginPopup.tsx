import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const signUpSecurityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your mother's maiden name?",
];

const LoginPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
    const [securityAnswers, setSecurityAnswers] = useState(["", "", ""]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
    const [userType, setUserType] = useState<"Mentor" | "Mentee" | null>(null);
    const [major, setMajor] = useState("");
    const [company, setCompany] = useState("");
    const [industry, setIndustry] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [isTwoFactorActive, setIsTwoFactorActive] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isLogin && !showSecurityQuestions) {
            if (!username || !password || !userType) {
                setError("Username, password, and user type are required");
                return;
            }
            if (userType === "Mentee" && !major) {
                setError("Major is required for Mentees");
                return;
            }
            if (userType === "Mentor" && (!company || !industry)) {
                setError("Company and industry are required for Mentors");
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
                  userType,
                  major: userType === "Mentee" ? major : undefined,
                  company: userType === "Mentor" ? company : undefined,
                  industry: userType === "Mentor" ? industry : undefined,
                  securityQuestions: signUpSecurityQuestions.map(
                      (question, index) => ({
                          question,
                          answer: securityAnswers[index],
                      })
                  ),
              };
        console.log(payload);
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
            console.log(data.message);
            if (
                data.message ===
                "Check your email for your two factor authentication code"
            ) {
                setIsTwoFactorActive(true);
                return;
            }
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

    const handleTwoFactorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("../api/two_fac", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, code: twoFactorCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to verify 2FA code"
                );
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

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            const response = await fetch("../api/get-security-questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to fetch security questions"
                );
            }

            const data = await response.json();
            console.log(data);
            setSecurityQuestions(data.questions);
            setShowSecurityQuestions(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    const handleSecurityAnswersSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (securityAnswers.some((answer) => !answer.trim())) {
            setError("Please answer all security questions");
            return;
        }

        try {
            const response = await fetch("../api/verify-answers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, answers: securityAnswers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to verify answers"
                );
            }

            const data = await response.json();
            setSuccessMessage(
                "A password reset link has been sent to your email."
            );
            setShowSecurityQuestions(false);
            setShowForgotPassword(false);
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
    const placeHolderText = isLogin ? "Username or Email" : "Username";
    return (
        <div
            className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'
            style={{ zIndex: 1000 }}>
            <div className='bg-[#262d34] p-8 rounded-lg w-96'>
                <h2 className='text-2xl text-text-primary mb-6'>
                    {showForgotPassword
                        ? showSecurityQuestions
                            ? "Security Questions"
                            : "Reset Password"
                        : isLogin
                        ? "Login"
                        : "Sign Up"}
                </h2>

                {isTwoFactorActive ? (
                    <form onSubmit={handleTwoFactorSubmit}>
                        <input
                            type='text'
                            placeholder='Enter your 2FA code'
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                            title="2FA code input"
                        />
                        <button
                            type='submit'
                            title="Submit 2FA code"
                            className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                            Verify Code
                        </button>
                        <button
                            type='button'
                            title="Back to login"
                            onClick={() => setIsTwoFactorActive(false)}
                            className='w-full text-primary mt-2 hover:text-primary-dark transition-colors duration-200'>
                            Back to Login
                        </button>
                    </form>
                ) : showForgotPassword ? (
                    showSecurityQuestions ? (
                        <form onSubmit={handleSecurityAnswersSubmit}>
                            {securityQuestions.map((question, index) => (
                                <div key={index} className='mb-4'>
                                    <p className='text-text-primary mb-2'>
                                        {question}
                                    </p>
                                    <input
                                        type='text'
                                        title="Security question answer input"
                                        placeholder='Your answer'
                                        value={securityAnswers[index] || ""}
                                        onChange={(e) =>
                                            handleSecurityAnswerChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded outline-none'
                                    />
                                </div>
                            ))}
                            <div className='flex gap-4'>
                                <button
                                    type='button'
                                    title="Click to go back to forgot password"
                                    onClick={() =>
                                        setShowSecurityQuestions(false)
                                    }
                                    className='w-full bg-gray-500 text-text-primary px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200'>
                                    Back
                                </button>
                                <button
                                    type='submit'
                                    title="Submit security question answers"
                                    className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                                    Verify Answers
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <input
                                type='email'
                                placeholder='Enter your email'
                                value={email}
                                title="Email input"
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                            />
                            <button
                                type='submit'
                                title="Get security questions"
                                className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                                Get Security Questions
                            </button>
                            <button
                                type='button'
                                title="Click to go back to login"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setError(null);
                                    setSuccessMessage(null);
                                }}
                                className='w-full text-primary mt-2 hover:text-primary-dark transition-colors duration-200'>
                                Back to Login
                            </button>
                        </form>
                    )
                ) : !isLogin && showSecurityQuestions ? (
                    <form onSubmit={handleSubmit}>
                        {signUpSecurityQuestions.map((question, index) => (
                            <div key={index} className='mb-4'>
                                <p className='text-text-primary mb-2'>
                                    {question}
                                </p>
                                <input
                                    type='text'
                                    placeholder='Your answer'
                                    title="Security question answer input"
                                    value={securityAnswers[index]}
                                    onChange={(e) =>
                                        handleSecurityAnswerChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded outline-none'
                                />
                            </div>
                        ))}
                        <div className='flex gap-4'>
                            <button
                                type='button'
                                title='Click to go back to sign up'
                                onClick={() => setShowSecurityQuestions(false)}
                                className='w-full bg-gray-500 text-text-primary px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200'>
                                Back
                            </button>
                            <button
                                type='submit'
                                title='Click to sign up'
                                className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                                Complete Sign Up
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type='text'
                            placeholder={placeHolderText}
                            value={username}
                            title="Input username"
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                        />
                        {!isLogin && (
                            <input
                                type='email'
                                placeholder='Email (optional)'
                                title="Input email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                            />
                        )}
                        <input
                            type='password'
                            placeholder='Password'
                            title="Input password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                        />
                        {!isLogin && (
                            <div className='mb-4'>
                                <label className='text-text-primary mb-2 block'>
                                    Are you a Mentor or Mentee?
                                </label>
                                <select
                                    value={userType || ""}
                                    onChange={(e) =>
                                        setUserType(
                                            e.target.value as
                                                | "Mentor"
                                                | "Mentee"
                                        )
                                    }
                                    className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded outline-none'>

                                    <option value='' disabled>
                                        Select an option
                                    </option>
                                    <option value='Mentor'>Mentor</option>
                                    <option value='Mentee'>Mentee</option>
                                </select>
                            </div>
                        )}
                        {!isLogin && userType === "Mentee" && (
                            <input
                                type='text'
                                placeholder='Major'
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                            />
                        )}
                        {!isLogin && userType === "Mentor" && (
                            <>
                                <input
                                    type='text'
                                    placeholder='Company'
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                                />
                                <input
                                    type='text'
                                    placeholder='Industry'
                                    value={industry}
                                    onChange={(e) =>
                                        setIndustry(e.target.value)
                                    }
                                    className='w-full bg-[#2C353D] text-text-primary px-4 py-2 rounded mb-4 outline-none'
                                />
                            </>
                        )}
                        <button
                            type='submit'
                            title="Click to login or sign up"
                            className='w-full bg-primary text-text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200'>
                            {isLogin
                                ? "Login"
                                : "Continue to Security Questions"}
                        </button>
                        {isLogin &&
                            !showForgotPassword &&
                            !showSecurityQuestions && (
                                <button
                                    type='button'
                                    title="Click to reset password"
                                    onClick={() => setShowForgotPassword(true)}
                                    className='w-full text-primary mt-2 hover:text-primary-dark transition-colors duration-200'>
                                    Forgot Password?
                                </button>
                            )}
                    </form>
                )}

                {error && <p className='text-primary-dark mt-4'>{error}</p>}
                {successMessage && (
                    <p className='text-green-500 mt-4'>{successMessage}</p>
                )}

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
                            }}>
                            {isLogin ? "Sign Up" : "Login"}
                        </span>
                    </p>
                )}

                <button
                    onClick={onClose}
                    title="Close the popup"
                    className='absolute top-4 right-4 text-text-primary text-2xl'>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default LoginPopup;
