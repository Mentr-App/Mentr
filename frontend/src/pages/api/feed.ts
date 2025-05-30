import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization || "";

    // Get pagination parameters from request query
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 50;
    const sort_by = req.query.sort_by || "new";
    const activity = req.query.activity || "undefined"

    // Include pagination parameters in the URL
    const flaskApiUrl = `http://localhost:8000/feed?skip=${skip}&limit=${limit}&sort_by=${sort_by}&activity=${activity}`;

    try {
        const response = await fetch(flaskApiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }), // Add auth header if available
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res
                .status(response.status)
                .json({ message: errorData.message || "Error fetching feed" });
        }

        const data = await response.json();
        console.log(data)
        // console.log(data);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching feed:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
