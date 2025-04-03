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
                <h1 className="text-4xl text-center text-[#EC6333] font-bold">Contact Us</h1>

                <div className="mt-12 space-y-10">
                    {/* Social Media Links */}
                    <div className="bg-secondary p-8 rounded-xl shadow-lg">
                        <h2 className="text-lg text-[#EC6333] font-bold">Reach Out to Us On Social Media!</h2>
                        <div className="flex-container">
                            <div className="flex-child">
                                <div className="up">
                                    <a href="https://www.instagram.com/pkang323/" target="_blank" rel="noopener noreferrer">
                                        <button className="card1" title="Visit our Instagram">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="60px" height="60px" fill="#EC6333">
                                                <g transform="scale(8,8)">
                                                    <path d="M11.46875,5c-3.55078,0 -6.46875,2.91406 -6.46875,6.46875v9.0625c0,3.55078 2.91406,6.46875 6.46875,6.46875h9.0625c3.55078,0 6.46875,-2.91406 6.46875,-6.46875v-9.0625c0,-3.55078 -2.91406,-6.46875 -6.46875,-6.46875zM11.46875,7h9.0625c2.47266,0 4.46875,1.99609 4.46875,4.46875v9.0625c0,2.47266 -1.99609,4.46875 -4.46875,4.46875h-9.0625c-2.47266,0 -4.46875,-1.99609 -4.46875,-4.46875v-9.0625c0,-2.47266 1.99609,-4.46875 4.46875,-4.46875zM21.90625,9.1875c-0.50391,0 -0.90625,0.40234 -0.90625,0.90625c0,0.50391 0.40234,0.90625 0.90625,0.90625c0.50391,0 0.90625,-0.40234 0.90625,-0.90625c0,-0.50391 -0.40234,-0.90625 -0.90625,-0.90625zM16,10c-3.30078,0 -6,2.69922 -6,6c0,3.30078 2.69922,6 6,6c3.30078,0 6,-2.69922 6,-6c0,-3.30078 -2.69922,-6 -6,-6zM16,12c2.22266,0 4,1.77734 4,4c0,2.22266 -1.77734,4 -4,4c-2.22266,0 -4,-1.77734 -4,-4c0,-2.22266 1.77734,-4 4,-4z"/>
                                                </g>
                                            </svg>
                                        </button>
                                    </a>
                                    <a href="https://twitter.com/corig04" target="_blank" rel="noopener noreferrer">
                                        <button className="card2" title="Visit our Twitter">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="60px" height="60px" fill="#EC6333">
                                                <path d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429"/>
                                            </svg>
                                            
                                        </button>
                                    </a>
                                    <a href="https://github.com/Mentr-App" target="_blank" rel="noopener noreferrer">
                                        <button className="card3" title="View our GitHub repository">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="60px" height="60px" fill="#EC6333" className="github">    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path></svg>
                                    
                                        </button>
                                    </a>
                                    <a href="https://www.linkedin.com/in/matthew-sigit" target="_blank" rel="noopener noreferrer">
                                        <button className="card4" title="Connect with us on LinkedIn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#EC6333" className="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg>
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                        Alternatively, Contact Us Here!
                                    </label>
                                    <textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full p-3 border border-border rounded-lg bg-[#2C353D] text-white"
                                        rows={4}
                                        placeholder="Write your message here..."
                                        required
                                        title="Write your message to the Mentr team"
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
        </div>
    );
};

export default Contact;
