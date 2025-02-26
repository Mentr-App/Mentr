import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { answers, email} = req.body;
    
        if (!email || !answers) {
            return res.status(401).json({ message: 'Answers must not be empty'});
        }
        const flaskApiUrl = "http://localhost:8000/auth/verify_answers";
        const response = await fetch(flaskApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({answers, email})
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: errorData.message});
        }

        const message = await response.json();
        console.log(message)
        return res.status(200).json(message);
    } catch (error) {
        console.error("Error security questions:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}