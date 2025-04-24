import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    const authHeader = req.headers.authorization;


    try {
        const response = await fetch("http://localhost:8000/chat/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
        });

        const data = await response.json().catch((e) => {
            console.error("Error parsing response:", e);
            return null;
        });

        console.log("Backend response:", {
            status: response.status,
            data,
        });

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to find user",
                error: data?.error || "Unknown error",
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error finding users:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
