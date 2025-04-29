import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const flaskRes = await fetch(`http://localhost:8000/match/pending?userId=${userId}`);
    const text = await flaskRes.text();
    res.status(flaskRes.status).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
