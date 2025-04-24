import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    const searchKey = (req.query.key as string || '').trim();

    if (!searchKey) {
        // Mirror Flask behavior or return predefined response
        return res.status(200).json([]); // Assuming Flask returns empty list for no key
      }

    try {
        const params = new URLSearchParams({ key: searchKey });
        const response = await fetch(`http://localhost:8000/user/users?${params.toString()}`, {
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

        console.log(data)
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error finding users:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
