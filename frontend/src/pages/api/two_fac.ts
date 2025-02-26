import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const response = await fetch('http://localhost:8000/auth/two_factor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ message: errorData.message });
    }

    const { access_token, refresh_token } = await response.json();
    
    return res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}