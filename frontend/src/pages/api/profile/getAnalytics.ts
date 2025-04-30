import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userId, username } = req.query;
    const authHeader = req.headers.authorization || "";

    if (!userId && !username) {
        return res.status(400).json({ message: "Either userId or username is required" });
    }
    try {
        // Construct the URL based on provided parameters
        let endpoint = `http://localhost:8000/profile/analytics?`;
        if (userId) {
            endpoint += `userId=${userId}`;
        } else if (username) {
            endpoint += `username=${username}`;
        }

        console.log("Calling backend endpoint:", endpoint);

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        // Get the response as text first for debugging
        const responseText = await response.text();
        console.log("Raw response from backend:", responseText);

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Error parsing JSON response:", e);
            return res.status(500).json({
                message: "Invalid response format from server",
                error: `Server returned non-JSON response: ${responseText.substring(
                    0,
                    200
                )}...`,
                endpoint: endpoint,
                statusCode: response.status,
                statusText: response.statusText,
            });
        }
        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to fetch user analytics",
                error: data?.error || "Unknown error",
                endpoint: endpoint,
                responseStatus: response.status,
                responseStatusText: response.statusText,
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching user analytics:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
    }
}
