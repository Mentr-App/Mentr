import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        const requestBody = {
            title,
            content,
        };

        console.log("Sending request to backend:", {
            body: requestBody,
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        const response = await axios({
            method: "POST",
            url: "http://localhost:8000/post",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
            data: requestBody,
        });

        const data = response.data;

        // console.log("Backend response:", {
        //     status: response.status,
        //     data,
        // });

        return res.status(201).json(data);
    } catch (error) {
        console.error("Error creating post:", error);

        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status || 500;
            const errorData = error.response?.data || {
                message: "Failed to create post",
                error: "Unknown error",
            };

            return res.status(statusCode).json(errorData);
        }

        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
