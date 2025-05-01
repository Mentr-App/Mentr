import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("http://localhost:8000/verify/universities");

    if (!response.ok) {
      const text = await response.text();
      console.error("Flask error response:", text);
      return res.status(response.status).json({ message: "Flask error", body: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Universities fetch error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
