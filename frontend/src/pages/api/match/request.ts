import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const flaskRes = await fetch("http://localhost:8000/match/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await flaskRes.text(); // Flask returns JSON-safe BSON
    res.status(flaskRes.status).send(text);
  } catch (error) {
    console.error("Error proxying to Flask:", error);
    return res.status(500).json({ message: "Proxy error", error: String(error) });
  }
}
