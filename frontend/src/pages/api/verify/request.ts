// /api/verify/request.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { company, domain } = req.body;
  if (!company || !domain) return res.status(400).json({ message: "Missing fields" });

  try {
    const response = await fetch("http://localhost:8000/verify/company_request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, domain }),
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (err) {
    console.error("Company request error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
