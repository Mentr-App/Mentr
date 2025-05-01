// /api/verify/companies.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const response = await fetch("http://localhost:8000/verify/companies");
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Companies fetch error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
