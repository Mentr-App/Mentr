import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ message: "UserID parameter is required" });
    }

    try {
        const response = await fetch(
            `http://localhost:8000/profile/public?userID=${userID}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json().catch((e) => {
            console.error("Error parsing response:", e);
            return null;
        });

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to find user",
                error: data?.error || "Unknown error",
            });
        }

        const publicProfile = {
            username: data.username,
            userType: data.userType,
            email: data.email,
            major: data.major,
            company: data.company,
            industry: data.industry,
            linkedin: data.linkedin,
            instagram: data.instagram,
            twitter: data.twitter,
            profile_picture: data.profile_picture,
            created_at: data.created_at,
            bio: data.bio,
            interests: data.interests,
        };

        return res.status(200).json(publicProfile);
    } catch (error) {
        console.error("Error finding public profile:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
