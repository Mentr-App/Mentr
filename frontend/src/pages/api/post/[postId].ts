import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { postId } = req.query;
    const { action } = req.query;
    const authHeader = req.headers.authorization || "";

    if (!postId || typeof postId !== "string") {
        return res.status(400).json({ message: "Invalid post ID" });
    }

    try {
        let method = req.method;
        let endpoint = `http://localhost:8000/post/${postId}`;

        const requestOptions: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
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
        console.log(data)
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error interacting with post:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
