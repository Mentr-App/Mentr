import React, { useState } from "react";
import Link from "next/link";

const FAQ: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>("");
    const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
    const [revealThank, setRevealThank] = useState<boolean>(false);

    const questionsAnswers = [
        {
            question: "What is Mentr?",
            answer: "Mentr is a university-verified platform designed to connect students with alumni for personalized mentorship. Our purpose is for students to ask industry-related questions, match with mentors, and participate in a forum to gain career insights and advice."
        },
        {
            question: "How do I register for an account?",
            answer: "To register for an account on Mentr, simply click on 'Sign Up' and provide your university email to verify your identity. Once registered, you can create a profile and start interacting with mentors and the forum."
        },
        {
            question: "Can I change my profile details?",
            answer: "Yes, you can update critical information such as your password, username, email, and profile picture directly from your account settings. You can also update your mentor or mentee status if needed."
        },
        {
            question: "How does mentor-mentee matching work?",
            answer: "Mentor-mentee matching on Mentr is based on an algorithm that considers ratings, experience, and user-defined preferences. Mentees can set preferences and view profiles, while mentors are notified when a match occurs."
        },
        {
            question: "What kind of forum interactions are available?",
            answer: "The forum allows users to post questions, upload images, comment on discussions, and like or save posts for later viewing. Posts can also be edited, and users can search and filter content based on various criteria."
        },
        {
            question: "How can I ensure my privacy on the platform?",
            answer: "Mentr takes user privacy seriously. You can block other users to prevent them from viewing your profile, messages, or posts. Additionally, all data is securely stored, and you can delete your account at any time to remove all associated information."
        },
        {
            question: "What are the benefits of becoming a mentor?",
            answer: "As a mentor, you can help guide students by sharing industry knowledge and experience. You will also receive notifications when a mentee matches with you and be able to remove mentees if necessary."
        }
    ];

    const handleToggle = (index: number) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmittingFeedback(true);

        try {
            const response = await fetch("../../pages/api/feedback", {
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
                    Frequently Asked Questions
                </h1>
                <div className="space-y-4">
                    {questionsAnswers.map((qa, index) => (
                        <div key={index}>
                            <button
                                onClick={() => handleToggle(index)}
                                className={`w-full text-left py-4 px-4 text-lg font-bold rounded text-[#EC6333] transition-colors duration-300 ${
                                    activeIndex === index ? "bg-[#3C454D]" : "bg-[#2C353D]"
                                }`}>
                                {qa.question}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-500 ${
                                    activeIndex === index ? "max-h-40" : "max-h-0"
                                }`}>
                                <p className="px-4 py-2 block rounded text-white bg-[#2F383G] font-medium">{qa.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <form onSubmit={submitFeedback} className="space-y-4">
                        <label htmlFor="feedback" className="block font-bold text-[#EC6333] bg-[#2C353D]">
                            Don't see your question? Ask us here!
                        </label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={handleFeedbackChange}
                            className="w-full p-3 border border-border rounded-lg bg-[#2C353D] text-white"
                            rows={4}
                            placeholder="Write your question here..."
                        ></textarea>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#EC6333] text-white font-bold rounded-lg hover:bg-accent-hover disabled:opacity-50 transition duration-300"
                            disabled={submittingFeedback}>
                            {submittingFeedback ? "Submitting..." : "Submit Question"}
                        </button>
                    </form>
                    {revealThank && (
                        <p className="block font-bold text-[#EC6333] bg-[#2C353D]">
                            Thank you for reaching out!
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block font-bold text-[#EC6333] bg-[#2C353D]">
                        Or, Contact Us Directly:
                    </label>
                    <div className="=mt-1">
                    <Link legacyBehavior href="/contact">
                        <a className="block px-4 py-2 bg-[#EC6333] text-white text-center font-bold rounded-lg hover:bg-accent-hover transition duration-300">
                            Contact Us
                        </a>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FAQ;
