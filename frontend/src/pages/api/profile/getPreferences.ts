// pages/api/profile/getPreferences.ts
import { NextApiRequest, NextApiResponse } from "next";
import { use } from "react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);

  const authHeader = req.headers.authorization;
  const { userId } = req.query;

  try {
    // Forward to backend preferences endpoint
    var endpoint = `http://localhost:8000/profile/preferences`;
    if (userId) {
      endpoint += "?userId=";
      endpoint += userId;
    }
    console.log(endpoint)
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    // Attempt to parse JSON
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
        message: data?.message || "Failed to load preferences",
        error: data?.error || "Unknown error",
      });
    }

    // Return the preferences as-is
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
