import { NextApiRequest, NextApiResponse } from "next";

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({message: "Method Not Allowed"})
    }

    const { postId } = req.query
    const {content} = req.body
    console.log("postId:", postId)
    console.log("content:", content)
    const authHeader = req.headers.authorization || ""
    const body = {
        postId: postId,
        content: content
    }
    console.log("Autheader:", authHeader)

    if (!postId || typeof postId !== "string") {
        return res.status(400).json({message: "Invalid post ID"})
    }

    try {
        let method = req.method
        let endpoint = `http://localhost:8000/post/${postId}/edit`
        const requestOptions: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        };

        requestOptions.body = JSON.stringify(body)

        const response = await fetch(endpoint, requestOptions)
        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({message: "Error parsing response"}))
            console.error("Backend API error:", response.status, errorData)
            return res.status(response.status).json(errorData)
        }

        const data = await response.json()
        return res.status(200).json(data)
    }
    catch (error) {
        console.log("Error editing post:", error)
        return res.status(500).json({message: "Internal Server Error"})
    }
}