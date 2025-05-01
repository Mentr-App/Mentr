// /pages/api/verify/submit.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Missing email or code" });
  }

  const token = req.headers.authorization || `Bearer ${req.cookies.access_token || ""}`;

  try {
    const response = await fetch("http://localhost:8000/verify/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error("Verification submit error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
