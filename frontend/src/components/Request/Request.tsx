import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Adjust as needed

const Contact = () => {
    const { isAuthenticated } = useAuth();

    const [feedback, setFeedback] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [profileName, setProfileName] = useState<string>("Anonymous");
    const [anonymous, setAnonymous] = useState<boolean>(false);
    const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
    const [confirmationMsg, setConfirmationMsg] = useState<string>("");
    const [profileLoaded, setProfileLoaded] = useState<boolean>(!isAuthenticated);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) return;

                const res = await fetch("/api/profile/getProfile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfileName(data.username || "Anonymous");
                }
            } catch (err) {
                console.error("Failed to load profile name");
            } finally {
                setProfileLoaded(true);
            }
        };

        if (isAuthenticated) fetchProfile();
    }, [isAuthenticated]);

    const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isAuthenticated && !profileLoaded && !anonymous) {
            alert("Please wait — loading your profile...");
            return;
        }

        setSubmittingFeedback(true);

        try {
            const userId = localStorage.getItem("userId");

            const payload: any = {
                feedback,
                anonymous,
            };

            if (anonymous) {
                payload.name = "Anonymous";
            } else if (isAuthenticated) {
                payload.name = profileName || "Anonymous";
            } else {
                payload.name = name || "Anonymous";
            }

            if (isAuthenticated && !anonymous) {
                payload.userId = userId;
            }

            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to submit feedback");

            if (anonymous || (!isAuthenticated && !name)) {
                setConfirmationMsg("Feedback submitted anonymously.");
            } else if (!anonymous && !isAuthenticated && name) {
                setConfirmationMsg(`Feedback submitted under the name "${name}".`);
            } else {
                setConfirmationMsg("Feedback submitted under your profile.");
            }
        } catch (error: any) {
            alert(error.message || "An unknown error occurred");
        } finally {
            setSubmittingFeedback(false);
            setFeedback("");
            setName("");
            setAnonymous(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary rounded flex flex-col items-center justify-center py-10">
            <div className="bg-[#2C353D] rounded-lg shadow-lg p-8 max-w-3xl w-full">
                <h1 className="text-4xl text-center text-[#EC6333] font-bold">Request a New Feature!</h1>

                    {/* Feedback Form */}
                    <div className="bg-secondary p-8 rounded-xl shadow-lg">
                        <div className="mt-8">
                            {confirmationMsg ? (
                                <p className="mt-4 block font-bold text-[#EC6333] bg-[#2C353D] p-4 rounded">
                                    {confirmationMsg}
                                </p>
                            ) : (
                                <form onSubmit={submitFeedback} className="space-y-4">
                                    <label htmlFor="feedback" className="text-xl block font-bold text-[#EC6333]">
                                    </label>
                                    <textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full p-3 border border-border rounded-lg bg-[#2C353D] text-white"
                                        rows={4}
                                        placeholder="Write your request here..."
                                        required
                                        title="Write your request to the Mentr team"
                                    ></textarea>

                                    {!isAuthenticated && (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={anonymous}
                                            placeholder="Enter your name (optional)"
                                            className="w-full p-3 border border-border rounded-lg bg-[#2C353D] text-white"
                                            title="Enter your name if you’d like us to know who you are"
                                        />
                                    )}

                                    <label className="flex items-center space-x-2 text-white">
                                        <input
                                            type="checkbox"
                                            checked={anonymous}
                                            onChange={(e) => setAnonymous(e.target.checked)}
                                            title="Submit feedback without attaching your name"
                                        />
                                        <span>Submit anonymously</span>
                                    </label>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#EC6333] text-white font-bold rounded-lg hover:bg-accent-hover disabled:opacity-50 transition duration-300"
                                        disabled={submittingFeedback}
                                        title="Send your message to the Mentr team"
                                    >
                                        {submittingFeedback ? "Submitting..." : "Submit Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Contact;
