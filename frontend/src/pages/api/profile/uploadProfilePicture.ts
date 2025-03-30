import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const formData = new FormData();

    const chunks: Buffer[] = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    
    if (!boundary) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const parts = buffer.toString().split(`--${boundary}`);
    let fileContent: Buffer | null = null;
    let fileName: string | null = null;
    let contentType: string | null = null;

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data; name="file"')) {
        const lines = part.split('\r\n');
        const fileNameMatch = lines[1].match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
          contentType = lines[2].split(': ')[1];
          const content = lines.slice(4, -1).join('\r\n');
          fileContent = Buffer.from(content);
        }
        break;
      }
    }

    if (!fileContent || !fileName) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const file = new Blob([fileContent], { type: contentType || 'application/octet-stream' });
    formData.append('file', file, fileName);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/upload_profile_picture`, {
      method: 'POST',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ message: 'Error uploading profile picture' });
  }
}
