import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API route /api/match/matchable called");
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const authHeader = req.headers.authorization;

  try {
    const flaskRes = await fetch("http://localhost:8000/match/get_matches", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
      },
    });

    const text = await flaskRes.text(); // Flask returns BSON-safe JSON
    res.status(flaskRes.status).send(text);
  } catch (error) {
    console.error("Error in /api/match/matchable:", error);
    return res.status(500).json({ message: "Internal Server Error", error: String(error) });
  }
}
