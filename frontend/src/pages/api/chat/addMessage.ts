// pages/api/chat/messages/add.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Define the structure of the request body from the frontend
interface AddMessageRequestBody {
  chatId: string;
  content: string;
}

// Define the structure for success/error responses (should match Flask backend)
// **IMPORTANT**: Assumes Flask backend is modified to return the full Message object on success
type MessageResponse = any; // Use a more specific type if possible (matches frontend Message type)
type ErrorResponse = {
  message?: string;
  msg?: string;
};

// Define the target URL for the Flask backend endpoint
const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_ADD_MESSAGE_URL || 'http://localhost:8000/chat/addMessage'; // Adjust Flask route

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse | ErrorResponse>
) {
  // 1. Ensure it's a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 2. Extract Authorization header and request body
  const authorizationHeader = req.headers.authorization;
  const { chatId, content } = req.body as AddMessageRequestBody;

  // 3. Basic validation
  if (!authorizationHeader) {
      // Forward the request, let Flask handle auth error
      console.warn("Proxy received request without Authorization header.");
  }
  if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
    return res.status(400).json({ message: 'Missing or invalid chatId in request body.' });
  }
   if (content === null || content === undefined || typeof content !== 'string') {
     return res.status(400).json({ message: 'Missing or invalid content in request body.' });
   }


  try {
    // 4. Define the target URL for the Flask backend
    const targetUrl = FLASK_BACKEND_URL;

    console.log(`Proxying POST request to: ${targetUrl}`);

    // 5. Prepare headers for the Flask backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authorizationHeader) {
        headers['Authorization'] = authorizationHeader;
    }

    // 6. Make the fetch request to the Flask backend
    const flaskResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      // Forward the body received from the frontend
      body: JSON.stringify({ chatId: chatId.trim(), content: content }),
    });

    // 7. Relay the response from Flask back to the client
    const responseBody = await flaskResponse.json(); // Assume Flask responds with JSON

    // Forward the status code and JSON body from Flask
    // Ensure Flask returns 201 on success with the full message object
    return res.status(flaskResponse.status).json(responseBody);

  } catch (error: any) {
    // Handle errors during the fetch/proxy process
    console.error(`Error proxying /api/chat/messages/add to ${FLASK_BACKEND_URL}:`, error);

    if (error?.cause?.code === 'ECONNREFUSED') {
         console.error(`Connection refused when connecting to ${FLASK_BACKEND_URL}`);
         return res.status(503).json({ message: 'Service unavailable: Cannot connect to backend service.' });
    }
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("Failed to parse JSON response from Flask backend.");
        return res.status(502).json({ message: 'Bad Gateway: Invalid response received from backend service.' });
    }

    // Return a generic server error for other issues
    return res.status(500).json({ message: 'An internal server error occurred while proxying the request.' });
  }
}
