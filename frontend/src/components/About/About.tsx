import React, { useState } from "react";
import Link from "next/link";

const About: React.FC = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
    const [revealThank, setRevealThank] = useState<boolean>(false);

    const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmittingFeedback(true);

        try {
            const response = await fetch("../api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback }),
            });

            if (!response.ok) throw new Error("Failed to submit feedback");

            setRevealThank(true);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("An error occurred while submitting feedback.");
        } finally {
            setSubmittingFeedback(false);
            setFeedback("");
        }
    };

    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(event.target.value);
    };

    return (
        <div className="min-h-screen bg-[#2C353D] rounded flex flex-col items-center justify-center py-10">
            <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-3xl w-full">
                <h1 className="text-lg text-[#EC6333] font-bold">
                    About Us
                </h1>
                
                <div className="mt-4">
                    <h2 className="text-xl text-[#EC6333] font-semibold">
                        Our Mission
                    </h2>
                    <p className="text-white mt-2">
                        Our mission is to bridge the gap between students and professionals through personalized mentorship, enabling knowledge sharing and career guidance. We aim to foster a community where users can connect, share industry insights, and empower each other to achieve career success.
                    </p>
                </div>

                <div className="mt-4">
                    <h2 className="text-xl text-[#EC6333] font-semibold">
                        Our Values
                    </h2>
                    <p className="text-white mt-2">
                        We believe in the power of mentorship, inclusivity, and continuous learning. Our platform is built to create meaningful relationships between mentors and mentees, fostering growth through shared experiences and diverse perspectives. We value transparency, user privacy, and the integrity of each connection made.
                    </p>
                </div>

                <div className="mt-4">
                    <h2 className="text-xl text-[#EC6333] font-semibold">
                        Our Goals
                    </h2>
                    <p className="text-white mt-2">
                        Our goal is to create a user-friendly, secure platform that facilitates valuable mentorship experiences. We strive to continuously improve the platform with features that enhance matching accuracy, privacy control, and community engagement. Ultimately, we want to be the go-to platform for professional mentorship, helping students and alumni grow together.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-x-6 gap-y-6 mt-8">
            {[
                {
                    name: "Peter Kang",
                    description: "Peter works as a full-stack developer on forum features and user interactions."
                },
                {
                    name: "Nick Song",
                    description: "Nick works as a full-stack developer on profile features."
                },
                {
                    name: "Matthew Sigit",
                    description: "Matthew is the project manager, overseeing the team's progress and ensuring timely delivery of features."
                },
            ].map((member, index) => (
                <div key={index} className="flex flex-col items-start px-4 border border-white p-4">
                    <h3 className="text-[#EC6333] font-bold mb-2">{member.name}</h3>
                    <p className="text-white">{member.description}</p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6 mt-4">
            {[
                {
                    name: "Ethan Ling",
                    description: "Ethan handles DevOps and deployment, automating processes and making sure the app runs smoothly in production."
                },
                {
                    name: "Leo Gu",
                    description: "Leo works on user authentication and backend integration with third-parties and builds and maintains server-side logic and APIs."
                }
            ].map((member, index) => (
                <div key={index} className="flex flex-col items-start px-4 border border-white p-4">
                    <h3 className="text-[#EC6333] font-bold mb-2">{member.name}</h3>
                    <p className="text-white">{member.description}</p>
                </div>
            ))}
        </div>

                <div className="mt-6">
                    <label className="block font-bold text-[#EC6333] bg-[#2C353D]">
                        Contact Us Directly:
                    </label>
                    <Link legacyBehavior href="/contact">
                        <a className="block px-4 py-2 bg-[#EC6333] text-white text-center font-bold rounded-lg hover:bg-accent-hover transition duration-300">
                            Contact Us
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
