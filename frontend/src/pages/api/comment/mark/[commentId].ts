import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { commentId } = req.query;
    const { helpful } = req.body;

    // Validate helpful is a boolean
    if (typeof helpful !== "boolean") {
        return res
            .status(400)
            .json({ message: "Invalid 'helpful' parameter. Expected boolean." });
    }

    // Validate commentId
    if (!commentId || typeof commentId !== "string") {
        return res.status(400).json({ message: "Invalid comment ID" });
    }

    const authHeader = req.headers.authorization || "";

    try {
        const endpoint = `http://localhost:8000/comment/mark/${commentId}`;
        const requestOptions: RequestInit = {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({ helpful }),
        };

        const response = await fetch(endpoint, requestOptions);

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: "Error parsing response" }));
            console.error("Backend API error:", response.status, errorData);
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error marking comment:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
