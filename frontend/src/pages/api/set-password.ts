import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { token, password } = req.body;
    
        if (!token || !password) {
            return res.status(401).json({ message: 'Please try resetting password again.'});
        }
        const flaskApiUrl = "http://localhost:8000/auth/set_password";
        const response = await fetch(flaskApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token, password})
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: errorData.message});
        }

        const message = await response.json();
        console.log(message)
        return res.status(200).json(message);
    } catch (error) {
        console.error("Error sending password reset request:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}