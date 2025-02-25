import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(401).json({ message: 'Username must not be empty'});
        }


        return res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}