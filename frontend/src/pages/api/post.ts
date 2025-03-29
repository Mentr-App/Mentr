import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { title, content } = req.body;
    console.log("Request method:", req.method);
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    console.log("title:", title);
    console.log("content:", content);
    const authHeader = req.headers.authorization;

    if (!title || !content) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        console.log("Sending request to backend:", {
            body: JSON.stringify({
                title: title,
                content: content,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        const response = await fetch("http://localhost:8000/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify({
                title: title,
                content: content,
            }),
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
                message: data?.message || "Failed to create post",
                error: data?.error || "Unknown error",
            });
        }

        return res.status(201).json(data);
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
