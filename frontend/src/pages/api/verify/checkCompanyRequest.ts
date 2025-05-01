import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  const company = req.query.company as string;
  const token = req.headers.authorization || `Bearer ${req.cookies.access_token || ""}`;

  if (!company) return res.status(400).json({ message: "Company is required" });

  try {
    const response = await fetch(
      `http://localhost:8000/verify/checkRequest?company=${encodeURIComponent(company)}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Check company request error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
