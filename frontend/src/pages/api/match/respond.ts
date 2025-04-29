import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const flaskRes = await fetch("http://localhost:8000/match/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await flaskRes.text();
    res.status(flaskRes.status).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
