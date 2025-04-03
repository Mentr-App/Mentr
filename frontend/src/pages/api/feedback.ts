import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { feedback, name, anonymous, userId } = req.body;

    try {
        const response = await fetch('http://localhost:8000/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback, name, anonymous, userId })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.message || 'Failed to submit feedback',
            });
        }

        return res.status(201).json({ message: 'Feedback successfully submitted' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
