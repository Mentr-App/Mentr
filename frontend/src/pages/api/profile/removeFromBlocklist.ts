import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    

    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);

    const authHeader = req.headers.authorization;
    const { blockedUserID  } = req.body;

    try {
        const response = await fetch("http://localhost:8000/profile/remove_from_block_list", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify({
                blockedUserID
            }),
        });

        const data = await response.json().catch((e) => {
            console.error("Error parsing response:", e);
            return null;
        });

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to unblock user",
            });
        }

        return res.status(201).json(data);
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}