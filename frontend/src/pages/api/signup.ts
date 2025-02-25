import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, email, password, security_questions } = req.body;

  if (!username || !password || !security_questions) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  else if(username.length < 5 || username.length > 12) {
    return res.status(400).json({message: 'Invalid Username'})
  }
  if(password.length < 3) {
    return res.status(400).json({message: 'Invalid Password'})
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  }
  for (let i = 0; i < 3; i++) {
    
  }
  try {
    const response = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, security_questions }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ message: errorData.message });
    }

    const { access_token, refresh_token } = await response.json();

    res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}