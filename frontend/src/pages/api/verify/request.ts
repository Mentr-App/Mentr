// pages/api/verify/request.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1] || req.cookies.access_token;

  try {
    const response = await fetch("http://localhost:8000/verify/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    const result = isJson ? await response.json() : { message: await response.text() };
    return res.status(response.status).json(result);
  } catch (err) {
    console.error("Company request error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
