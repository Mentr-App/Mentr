// pages/api/verify/initiate.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { email } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!email) return res.status(400).json({ message: "Email required" });
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  try {
    const response = await fetch("http://localhost:8000/verify/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // 🟢 pass token to Flask
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error("Verification email error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
